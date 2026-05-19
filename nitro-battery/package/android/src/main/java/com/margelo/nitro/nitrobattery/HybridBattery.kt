package com.margelo.nitro.nitrobattery

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import com.margelo.nitro.NitroModules

class HybridBattery : HybridBatterySpec() {
    private val callbacks = mutableMapOf<Double, (info: BatteryInfo) -> Unit>()

    private var nextSubscriptionId = 0.0

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            // called when battery changes
            val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            val state: Int
            //Field requires API level 26 (current min is 24):
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                state = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS)
            } else {
                state = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
            }


            val info = createBatteryInfo(level.toDouble(), state)
            // send info to all subscribers
            callbacks.values.forEach { it(info) }

        }
    }

    override fun getBatteryInfo(): BatteryInfo {
        val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val state: Int
        //Field requires API level 26 (current min is 24):
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            state = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS)
        } else {
            val batteryIntent =
                context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            state = batteryIntent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        }

        return createBatteryInfo(level.toDouble(), state)
    }

    override fun subscribe(callback: (info: BatteryInfo) -> Unit): Double {
        val id = nextSubscriptionId++
        callbacks[id] = callback
        // send info immediately
        callback(getBatteryInfo())

        //register for battery change events if this is the first subscriber
        if (callbacks.size == 1) {
            context.registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        }
        return id
    }

    override fun unsubscribe(id: Double) {
        callbacks.remove(id)
        //unregister for battery change events when last subscriber is removed
        if (callbacks.isEmpty()) {
            context.unregisterReceiver(batteryReceiver)
        }
    }

    // helper function to create BatteryInfo from raw level and state values
    private fun createBatteryInfo(level: Double, state: Int): BatteryInfo {
        val levelResult = BatteryLevelResult.create(level)
        val stateResult = when (state) {
            BatteryManager.BATTERY_STATUS_UNKNOWN -> BatteryStateResult.UNKNOWN
            BatteryManager.BATTERY_STATUS_CHARGING -> BatteryStateResult.CHARGING
            BatteryManager.BATTERY_STATUS_DISCHARGING -> BatteryStateResult.UNPLUGGED
            BatteryManager.BATTERY_STATUS_FULL -> BatteryStateResult.FULL
            else -> BatteryStateResult.UNKNOWN
        }
        return BatteryInfo(levelResult, stateResult)
    }

    companion object {
        private val context =
            NitroModules.applicationContext ?: error("React native context not found")
        private val batteryManager =
            context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    }
}