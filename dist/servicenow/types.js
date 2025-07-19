"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Impact = exports.Urgency = exports.Priority = exports.RequestState = exports.IncidentState = void 0;
var IncidentState;
(function (IncidentState) {
    IncidentState["New"] = "1";
    IncidentState["InProgress"] = "2";
    IncidentState["OnHold"] = "3";
    IncidentState["Resolved"] = "6";
    IncidentState["Closed"] = "7";
    IncidentState["Canceled"] = "8";
})(IncidentState || (exports.IncidentState = IncidentState = {}));
var RequestState;
(function (RequestState) {
    RequestState["Open"] = "1";
    RequestState["WorkInProgress"] = "2";
    RequestState["Closed"] = "3";
    RequestState["Canceled"] = "4";
})(RequestState || (exports.RequestState = RequestState = {}));
var Priority;
(function (Priority) {
    Priority["Critical"] = "1";
    Priority["High"] = "2";
    Priority["Moderate"] = "3";
    Priority["Low"] = "4";
    Priority["Planning"] = "5";
})(Priority || (exports.Priority = Priority = {}));
var Urgency;
(function (Urgency) {
    Urgency["High"] = "1";
    Urgency["Medium"] = "2";
    Urgency["Low"] = "3";
})(Urgency || (exports.Urgency = Urgency = {}));
var Impact;
(function (Impact) {
    Impact["High"] = "1";
    Impact["Medium"] = "2";
    Impact["Low"] = "3";
})(Impact || (exports.Impact = Impact = {}));
//# sourceMappingURL=types.js.map