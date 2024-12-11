var fs = require("fs");
import { ColumnOption, parse } from 'csv-parse';

const pathPrefix = '../../data/';

export const convertCsvToChartData = (filename: string, headers: ColumnOption[], year: number) => {
    const data = fs.readFileSync(`${pathPrefix}/csv/${filename}`, 'utf8');
    parse(data, {
        delimiter: ',',
        columns: headers,
        from_line: 2
    }, (error, output) => {
        if (error) {
            console.error(error);
        } else {
            const formattedOutput = output.map((row: any) => ({
                x: row.month,
                y: parseInt(row.distance, 10)
            }));

            const outputFilePath = `${pathPrefix}/ts/${filename.replace('.csv', '')}.ts`;
            const fileContent = `export const monthlyDistanceIn${year} = ${JSON.stringify(formattedOutput, null, 2)};`;
            fs.writeFileSync(outputFilePath, fileContent, 'utf8');
        }
    });
}
for (let year = 2017; year <= 2024; year++) {
    convertCsvToChartData(`monthly-distance-in-${year}.csv`, ['month', 'distance'], year);
}