let tokenizer = null
let vm = new Vue({
    el: "#tool",
    data: {
        dict: "./js/dict/",
        inputText1: "",
        inputText2: "",
        result: "",
        isLoading: true,
        buttonText: "Loading"
    },
    methods: {
        execute: function () {
            vm.isLoading = true;
            vm.message = "Processing";

            if (tokenizer === null) {
                vm.isLoading = false;
                vm.isError = true;
                return;
            }

            const vector1 = this.vector(vm.inputText1);
            const vector2 = this.vector(vm.inputText2);
            vm.result = "Text Similarity: " + this.calc(vector1, vector2)
            vm.isLoading = false;
        },
        vector: function (text) {
            const tokens = tokenizer.tokenize(text);
            let result = []
            tokens.forEach(t => {
                if (t.pos === "名詞" && t.basic_form !== "*") {
                    if (t.surface_form in result) {
                        result[t.surface_form] += 1
                    } else {
                        result[t.surface_form] = 1
                    }
                }
            });
            return result
        },
        calc: function (vector1, vector2) {
            const sum1 = this.sum(vector1)
            let result1 = [];
            Object.keys(vector1).forEach((key) => {
                result1[key] = this.tfidf(vector1[key], vector2[key], sum1)
            })

            const sum2 = this.sum(vector2)
            let result2 = [];
            Object.keys(vector2).forEach((key) => {
                result2[key] = this.tfidf(vector2[key], vector1[key], sum2)
            })

            return this.cos(result1, result2)
        },
        tfidf : function(value1, value2, sum) {
            if (value2 !== undefined) {
                return value1 / sum * this.idf(2, 2)
            } else {
                return value1 / sum * this.idf(2, 1)
            }
        },
        idf: function(n, nt) {
            return Math.log2(n / (nt + 1)) + 1
        },
        sum: function (input) {
            let sum = 0;
            Object.keys(input).forEach((key) => {
                sum += input[key]
            })
            return sum;
        },
        dot: function (a, b) {
            let sum = 0;
            Object.keys(a).forEach((key) => {
                if (b[key] !== undefined) {
                    sum += b[key] * a[key]
                }
            });
            return sum;
        },
        cos: function (result1, result2) {
            const mag1 = Math.sqrt(this.dot(result1, result1))
            const mag2 = Math.sqrt(this.dot(result2, result2))
            if (mag1 && mag2) return this.dot(result1, result2) / (mag1 * mag2)
            else return 0
        },
    }
});

kuromoji.builder({dicPath: vm.dict}).build(function (error, _tokenizer) {
    if (error != null) {
        console.log(error)
    }
    tokenizer = _tokenizer;
    vm.buttonText = "Execute";
    vm.isLoading = false;
});
