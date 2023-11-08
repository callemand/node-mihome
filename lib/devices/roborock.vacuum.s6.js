const Device = require('../device-miio');
const {VERSION_2} = require("../utils");

module.exports = class extends Device {
    static model = 'roborock.vacuum.s6';
    static name = 'Roborock S6';
    static image =
        'https://static.home.mi.com/app/image/get/file/developer_156211621715fdn2i1.png';

    constructor(opts) {
        super({ ...opts, version: VERSION_2 });

        this._propertiesToMonitor = [
            'msg_ver',
            'msg_seq',
            'state',
            'battery',
            'clean_time',
            'clean_area',
            'error_code',
            'map_present',
            'in_cleaning',
            'in_returning',
            'in_fresh_state',
            'lab_status',
            'water_box_status',
            'fan_power',
            'dnd_enabled',
            'map_status',
            'is_locating',
            'lock_status',
            'mop_forbidden_enable',
            'debug_mode'
        ];
    }
    getState() {
        console.log(this.properties);
        const state = parseInt(this.properties.state, 10);

        switch (state) {
            case 1:
                return 'initiating';
            case 2:
                return 'charger-offline';
            case 3:
                return 'waiting';
            case 5:
                return 'cleaning';
            case 6:
                return 'returning';
            case 8:
                return 'charging';
            case 9:
                return 'charging-error';
            case 10:
                return 'paused';
            case 11:
                return 'spot-cleaning';
            case 12:
                return 'error';
            case 13:
                return 'shutting-down';
            case 14:
                return 'updating';
            case 15:
                return 'docking';
            case 17:
                return 'zone-cleaning';
            case 100:
                return 'full';
        }
        return 'unknown-' + state;
    }

    activateCleaning() {
        return this.miioCall('app_start', []);
    }

    /** NO FIXED UNDER */

    getMode() {
        const mode = parseInt(this.properties.is_mop, 10);
        if (mode === 0) return 'vacuum';
        if (mode === 1) return 'vacuum-mop';
        if (mode === 2) return 'mop';
        return undefined;
    }

    getFanLevel() {
        const fanLevel = parseInt(this.properties.fan_power, 10);
        if (fanLevel >= 0) return fanLevel + 1; // 0 - 3 -> 1 - 4
        return undefined;
    }

    /*
    getWaterLevel() {
      const waterLevel = parseInt(this.properties.water_grade, 10);
      if (waterLevel >= 11) return waterLevel - 10; // 11 - 13 -> 1 - 3
      return undefined;
    }
     */

    getBattery() {
        const battery = this.properties.battery;
        if (Number.isInteger(battery)) return battery;
        return undefined;
    }

    getVolume() {
        const volume = parseInt(this.properties.v_state, 10);
        if (volume > 0) return volume * 10;
        return undefined;
    }

    getSideBrushRemaining() {
        const sideBrushTotal = parseInt(this.properties.side_brush_hours, 10);
        const sideBrushUsed = parseInt(this.properties.side_brush_life, 10);

        if (sideBrushTotal >= 0 && sideBrushUsed) {
            return Math.max(
                ((sideBrushUsed - sideBrushTotal) / sideBrushUsed) * 100,
                0
            );
        }
        return undefined;
    }

    getMainBrushRemaining() {
        const mainBrushTotal = parseInt(this.properties.main_brush_hours, 10);
        const mainBrushUsed = parseInt(this.properties.main_brush_life, 10);

        if (mainBrushTotal >= 0 && mainBrushUsed) {
            return Math.max(
                ((mainBrushUsed - mainBrushTotal) / mainBrushUsed) * 100,
                0
            );
        }
        return undefined;
    }

    getHypaRemaining() {
        const hypaTotal = parseInt(this.properties.hypa_hours, 10);
        const hypaUsed = parseInt(this.properties.hypa_life, 10);

        if (hypaTotal >= 0 && hypaUsed) {
            return Math.max(((hypaUsed - hypaTotal) / hypaUsed) * 100, 0);
        }
        return undefined;
    }

    getMopRemaining() {
        const mopTotal = parseInt(this.properties.mop_hours, 10);
        const mopUsed = parseInt(this.properties.mop_life, 10);

        if (mopTotal >= 0 && mopUsed) {
            return Math.max(((mopUsed - mopTotal) / mopUsed) * 100, 0);
        }
        return undefined;
    }

    setCharge(v) {
        return this.miioCall('set_charge', [v ? 1 : 0]);
    }

    setClean() {
        return this.miioCall('set_mode_withroom', [0, 1, 0]);
    }

    setPause() {
        return this.miioCall('set_mode_withroom', [0, 2, 0]);
    }

    setStop() {
        return this.charge();
    }

    setMode(v) {
        if (v === 'vacuum') v = 0;
        else if (v === 'vacuum-mop') v = 1;
        else if (v === 'mop') v = 2;
        return this.miioCall('set_mop', [v]);
    }

    setFanLevel(v) {
        return this.miioCall('set_suction', [v - 1]);
    }

    setWaterLevel(v) {
        return this.miioCall('set_suction', [v + 10]);
    }

    setMute(v) {
        return this.miioCall('set_voice', [v ? 0 : 1, 5]);
    }

    setVolume(v) {
        // 1 - 100
        return this.miioCall('set_voice', [1, v / 10]);
    }

    setLanguage(v) {
        if (v === 'cn') v = 1;
        else if (v === 'en') v = 2;
        this.call('set_language', [v]);
    }

    find() {
        this.call('set_resetpos', []);
    }
};
