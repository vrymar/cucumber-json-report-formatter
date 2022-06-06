import fs from 'fs'
import readline from 'readline'

export class Helper {
    public async readFileIntoJson(file){
        const result: string[] = []
        const fileStream = fs.createReadStream(file)
        const readLine = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of readLine) {
            result.push(await this.parseJson(line))         
        }
        return result
    }

    public writeFile(filePath, content){
        try {
            console.info(`Write to the file: ${filePath}`)
            fs.writeFileSync(filePath, content, {flag: 'w+'});
        } catch (err) {
            console.error(`Failed to write the file: ${filePath}`);
        }
    }

    public async parseJson(data){        
        try {
            const jsonString = JSON.stringify(data)
            return JSON.parse(jsonString)          
        } catch (err) {
            console.error("Error parsing JSON string:", err);
        }        
    }

    public getJsonFromArray(arrayJsonFile, startWord){
        const foundJson: string[] = []
        arrayJsonFile.forEach(json => {
            if (JSON.stringify(json).startsWith(startWord, 4)){
                foundJson.push(json)
            }
        })
        console.debug(`Found JSON by content '${startWord}': ${foundJson}`)
        return foundJson
    }
}
