"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCsvToChartData = void 0;
var fs = require("fs");
var csv_parse_1 = require("csv-parse");
var pathPrefix = '../../data/';
var convertCsvToChartData = function (filename, headers) {
    var data = fs.readFileSync("".concat(pathPrefix, "/csv/").concat(filename), 'utf8');
    (0, csv_parse_1.parse)(data, {
        delimiter: ',',
        columns: headers,
        from_line: 2
    }, function (error, output) {
        if (error) {
            console.error(error);
        }
        else {
            output = output.map(function (row) { return (__assign(__assign({}, row), { distance: parseInt(row.distance, 10) })); });
            var outputFilePath = "".concat(pathPrefix, "/ts/").concat(filename.replace('.csv', ''), ".ts");
            var fileContent = "export const chartData = ".concat(JSON.stringify(output, null, 2), ";");
            fs.writeFileSync(outputFilePath, fileContent, 'utf8');
        }
    });
};
exports.convertCsvToChartData = convertCsvToChartData;
(0, exports.convertCsvToChartData)('monthly-distance-in-2017.csv', ['month', 'distance']);
