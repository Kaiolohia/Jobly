const { sqlForPartialUpdate } = require('./sql')

describe("sqlForPartialUpdate function", () => {
    test("Creates accurate snippets for sql query", () => {
        const result = sqlForPartialUpdate({
            "item_1" : "data_1",
            "item_2" : "data_2"
        }, {})
        expect(result).toEqual({
            "setCols": "\"item_1\"=$1, \"item_2\"=$2",
            values : ["data_1", "data_2"]
        })
    })
})