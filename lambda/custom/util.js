module.exports = {
    clean: function(str) {
        return str
            .replace(/[ÀÁÂÃÄÅ]/g, "A")
            .replace(/[àáâãäå]/g, "a")
            .replace(/[ÈÉÊË]/g, "E")
            .replace(/[èéêë]/g, "e")
    }
};