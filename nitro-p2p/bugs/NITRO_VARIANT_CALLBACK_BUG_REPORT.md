# Nitro iOS Swift/C++ Codegen Bug: Variant Callback Wrapper Mismatch

## Summary
When generating iOS Swift bridge code for a callback that accepts a union type (mapped to C++ std::variant), Nitro emits a wrapper type where a raw std::variant value is required.

This causes Swift compile failure in generated file HybridP2PSpec_cxx.swift for the subscribe callback.

## Environment
- Nitro-generated module: nitro-p2p
- Affected generated file: modules/nitro-p2p/nitrogen/generated/ios/swift/HybridP2PSpec_cxx.swift
- Spec source: modules/nitro-p2p/src/specs/p2p.nitro.ts
- Build command: pnpm expo run:ios --device <UDID>

## Relevant Spec
From modules/nitro-p2p/src/specs/p2p.nitro.ts, the callback is:

~~~ts
export type P2PEvent =
  | P2PPeerDiscovered
  | P2PPeerLost
  | P2PPeerConnected
  | P2PPeerDisconnected
  | P2PMessageReceived
  | P2PErrorEvent;

export type P2PEventCallback = (event: P2PEvent) => void;

export interface P2P extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  subscribe(callback: P2PEventCallback): number;
}
~~~

## Actual Generated Snippet (failing)
Generated around subscribe callback conversion:

~~~swift
let __wrappedFunction = bridge.wrap_Func_void_std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_(callback)
return { (__event: P2PEvent) -> Void in
  __wrappedFunction.call({ () -> bridge.std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_ in
    switch __event {
      case .first(let __value):
        return bridge.create_std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_(__value)
      ...
    }
  }())
}
~~~

### Compiler Error
~~~text
cannot convert value of type
'HybridP2PSpec_cxx.bridge.std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_'
to expected argument type
'std.__1.variant<margelo.nitro.nitrop2p.P2PPeerDiscovered, ...>'
~~~

## Expected Snippet
The generated wrapper must be unwrapped to raw variant when calling wrapped function:

~~~swift
let __wrappedFunction = bridge.wrap_Func_void_std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_(callback)
return { (__event: P2PEvent) -> Void in
  let __eventCpp = { () -> bridge.std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_ in
    switch __event {
      case .first(let __value):
        return bridge.create_std__variant_P2PPeerDiscovered__P2PPeerLost__P2PPeerConnected__P2PPeerDisconnected__P2PMessageReceived__P2PErrorEvent_(__value)
      ...
    }
  }()
  __wrappedFunction.call(__eventCpp.variant)
}
~~~

## Root Cause
The generated create_std__variant_... API returns a Swift bridge wrapper object, while wrapped function call(...) expects the underlying C++ std::variant payload.

The generator passes the wrapper object directly, instead of its raw payload field (.variant).

## Suggested Generator Fix
In Swift callback argument emission for variant-like bridge wrappers:
- If expression type is generated bridge wrapper for std::variant, pass its raw field to wrapped function call.
- In this case, emit .variant when invoking __wrappedFunction.call(...).

Pseudo-rule:

~~~text
if callbackArg is bridge wrapper for std::variant:
  emit wrappedArg.variant
else:
  emit wrappedArg
~~~

## Why This Matters
This is regeneration-sensitive. Manual edits in generated files are overwritten, so a template/codegen fix is required upstream.

## Minimal Repro Idea
1. Define a Nitro interface with method subscribe(callback: (event: UnionType) => void).
2. Make UnionType a 5+ branch tagged union to force std::variant generation.
3. Generate iOS Swift bridge.
4. Build iOS target and observe type mismatch in generated Swift callback wrapper call.
