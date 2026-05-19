package com.margelo.nitro.nitrofs

import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import java.io.File


class HybridFs : HybridFsSpec() {
    override val documentsDirectory: String
        get() = context.filesDir.absolutePath
    override val cacheDirectory: String
        get() = context.cacheDir.absolutePath
    override val tempDirectory: String
        get() = context.cacheDir.absolutePath + "/tmp" // Android doesn't have a separate temp directory, using cache directory instead, and appending /tmp to avoid conflicts with cache files

    override fun readFile(path: String): Promise<String> {
        return Promise.async {
            File(path).readText(Charsets.UTF_8)
        }
    }

    override fun writeFile(
        path: String, content: String
    ): Promise<Unit> {
        return Promise.async {
            File(path).writeText(content, Charsets.UTF_8)
            Unit
        }
    }

    override fun deleteFile(path: String): Promise<Unit> {
        return Promise.async {
            File(path).delete()
            Unit
        }
    }

    override fun mkdir(path: String): Promise<Unit> {
        return Promise.async {
            File(path).mkdirs()
            Unit
        }
    }

    override fun readDir(path: String): Promise<Array<FileEntry>> {
        return Promise.async {
            File(path).listFiles()?.map { file ->
                FileEntry(
                    name = file.name,
                    path = file.absolutePath,
                    isDirectory = file.isDirectory,
                    size = file.length().toDouble(),
                    lastModified = file.lastModified().toDouble()
                )
            }?.toTypedArray() ?: emptyArray()
        }
    }

    override fun exists(path: String): Promise<Boolean> {
        return Promise.async {
            File(path).exists()
        }
    }

    override fun move(
        srcPath: String, destPath: String
    ): Promise<Unit> {
        return Promise.async {
            File(srcPath).renameTo(File(destPath))
            Unit
        }
    }

    override fun copy(
        srcPath: String, destPath: String
    ): Promise<Unit> {
        return Promise.async {
            File(srcPath).copyTo(File(destPath))
            Unit
        }
    }


    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
    }

}