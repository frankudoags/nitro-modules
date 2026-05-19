package com.margelo.nitro.nitroclipboard

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.NullType

class HybridClipboard : HybridClipboardSpec() {
    override fun read(): ClipboardReadResult {
        val text = clipboard.primaryClip?.getItemAt(0)?.text?.toString()
        return if (text != null) {
            ClipboardReadResult.create(text)
        } else {
            ClipboardReadResult.create(NullType.NULL)
        }
    }

    override fun write(text: String) {
        clipboard.setPrimaryClip(ClipData.newPlainText("text", text))
    }

    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
        private val clipboard =
            context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    }
}