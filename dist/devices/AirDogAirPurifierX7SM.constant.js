"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirPurifierCleanCode = exports.AirPurifierLockCode = exports.AirPurifierFanLevelCodeMapping = exports.AirPurifierFanLevelCode = exports.AirPurifierModeCode = exports.AirPurifierSwitchStatusCode = exports.Specs = void 0;
// 特性信息
exports.Specs = {
    // 启动状态
    AirPurifierSwitchStatus: 'power',
    // 风扇级别
    AirPurifierFanLevel: 'speed',
    // 运行模式
    AirPurifierMode: 'mode',
    // 环境质量
    EnvironmentPM25Density: 'pm',
    EnvironmentHCHODensity: 'hcho',
    // 锁定控制
    PhysicalControlLocked: 'lock',
    // 清洁指示
    PhysicalCleanNeeded: 'clean',
};
// 启动状态枚举
var AirPurifierSwitchStatusCode;
(function (AirPurifierSwitchStatusCode) {
    AirPurifierSwitchStatusCode["On"] = "on";
    AirPurifierSwitchStatusCode["Off"] = "off";
})(AirPurifierSwitchStatusCode = exports.AirPurifierSwitchStatusCode || (exports.AirPurifierSwitchStatusCode = {}));
// 运行模式枚举
var AirPurifierModeCode;
(function (AirPurifierModeCode) {
    AirPurifierModeCode["Auto"] = "auto";
    AirPurifierModeCode["Sleep"] = "sleep";
    AirPurifierModeCode["Manual"] = "manual";
})(AirPurifierModeCode = exports.AirPurifierModeCode || (exports.AirPurifierModeCode = {}));
// 风扇级别枚举
var AirPurifierFanLevelCode;
(function (AirPurifierFanLevelCode) {
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["_"] = 0] = "_";
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["Level1"] = 1] = "Level1";
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["Level2"] = 2] = "Level2";
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["Level3"] = 3] = "Level3";
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["Level4"] = 4] = "Level4";
    AirPurifierFanLevelCode[AirPurifierFanLevelCode["Level5"] = 5] = "Level5";
})(AirPurifierFanLevelCode = exports.AirPurifierFanLevelCode || (exports.AirPurifierFanLevelCode = {}));
exports.AirPurifierFanLevelCodeMapping = {
    [AirPurifierFanLevelCode._]: 0,
    [AirPurifierFanLevelCode.Level1]: 20,
    [AirPurifierFanLevelCode.Level2]: 40,
    [AirPurifierFanLevelCode.Level3]: 60,
    [AirPurifierFanLevelCode.Level4]: 80,
    [AirPurifierFanLevelCode.Level5]: 100,
};
// 锁定状态枚举
var AirPurifierLockCode;
(function (AirPurifierLockCode) {
    AirPurifierLockCode["Lock"] = "lock";
    AirPurifierLockCode["Unlock"] = "unlock";
})(AirPurifierLockCode = exports.AirPurifierLockCode || (exports.AirPurifierLockCode = {}));
// 清洁状态枚举
var AirPurifierCleanCode;
(function (AirPurifierCleanCode) {
    AirPurifierCleanCode["Yes"] = "y";
    AirPurifierCleanCode["No"] = "n";
})(AirPurifierCleanCode = exports.AirPurifierCleanCode || (exports.AirPurifierCleanCode = {}));
//# sourceMappingURL=AirDogAirPurifierX7SM.constant.js.map