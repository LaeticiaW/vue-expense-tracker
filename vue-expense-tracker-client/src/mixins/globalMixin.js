import moment from 'moment'
import numeral from 'numeral'

/*
 * This mixin contains methods and filters for global use
 */

export default {
    methods: {
        /**
         * Sorts an array of objects by a string property, case insensitive
         * @param {array} arr - array of objects to sort
         * @param {string} property - name of property to sort by
         */
        sortArray(arr, property) {
            arr.sort((a, b) => {
                if (a[property].toLowerCase() < b[property].toLowerCase()) {
                    return -1
                }
                if (a[property].toLowerCase() > b[property].toLowerCase()) {
                    return 1
                }
                return 0
            })
        },

        /*
         * Vuetify rule for required input
         */
        ruleRequired(val) {
            if (val === null || val === undefined || val === '') {
                return 'Value is required'
            }
            return true
        }
    },
    filters: {
        /*
         * Format a date
         * @param {number} value - date value to format (iso string)
         * @param {string} format - date format
         */
        formatDate(value, format) {
            if (value) {
                return moment.utc(value).local().format(format || 'YYYY-MM-DD')
            }
            return null
        },

        /*
         * Format an amount value
         * @param {number} value - value to format
         */
        formatAmount(value) {
            if (value !== null && value !== undefined) {
                const formattedNum = numeral(value).format('0,0.00')
                return formattedNum === 'NaN' ? null : formattedNum
            }
            return null
        }
    }
}