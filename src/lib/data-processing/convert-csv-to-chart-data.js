"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCsvToChartData = void 0;
var fs = require("fs");
var csv_parse_1 = require("csv-parse");
var pathPrefix = '../../data/';
var convertCsvToChartData = function (filename, headers, year) {
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
            var formattedOutput = output.map(function (row) { return ({
                x: parseInt(row.month, 10),
                y: parseInt(row.distance, 10)
            }); });
            var outputFilePath = "".concat(pathPrefix, "/ts/").concat(filename.replace('.csv', ''), ".ts");
            var fileContent = "export const monthlyDistanceIn".concat(year, " = ").concat(JSON.stringify(formattedOutput, null, 2), ";");
            fs.writeFileSync(outputFilePath, fileContent, 'utf8');
        }
    });
};
exports.convertCsvToChartData = convertCsvToChartData;
for (var year = 2017; year <= 2024; year++) {
    (0, exports.convertCsvToChartData)("monthly-distance-in-".concat(year, ".csv"), ['month', 'distance'], year);
}
