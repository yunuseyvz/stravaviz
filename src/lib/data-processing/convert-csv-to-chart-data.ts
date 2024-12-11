var fs = require("fs");
import { ColumnOption, parse } from 'csv-parse';

const pathPrefix = '../../data/';

export const convertCsvToChartData = (filename: string, headers: ColumnOption[]) => {
    const data = fs.readFileSync(`${pathPrefix}/csv/${filename}`, 'utf8');
    parse(data, {
        delimiter: ',',
        columns: headers,
        from_line: 2
    }, (error, output) => {
        if (error) {
            console.error(error);
        } else {
            output = output.map((row: any) => ({
                ...row,
                distance: parseInt(row.distance, 10)
            }));

            const outputFilePath = `${pathPrefix}/ts/${filename.replace('.csv', '')}.ts`;
            const fileContent = `export const chartData = ${JSON.stringify(output, null, 2)};`;
            fs.writeFileSync(outputFilePath, fileContent, 'utf8');
        }
    });
}

convertCsvToChartData('monthly-distance-in-2017.csv', ['month', 'distance']);