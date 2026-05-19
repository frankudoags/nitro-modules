#include <jni.h>
#include <fbjni/fbjni.h>
#include "NitroP2pOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::nitrop2p::registerAllNatives();
  });
}
