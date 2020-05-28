<template>
    <div class="page">
        <page-header title="Expense Summary"/>

        <div class="page-content table-content">

            <!-- Filter -->
            <table-filter>
                <template v-slot:inputs>

                    <!-- Start and end dates -->
                    <date-range-input :date-range="filter" @date-range-changed="filterChanged"></date-range-input>

                    <!-- Category -->
                    <span class="filter-input select-input">
                        <v-select multiple dense outlined hide-details clearable v-model="filter.categoryIds"
                                  :items="selectCategories" class="category-select"
                                  label="Category" background-color="#ffffff"
                                  item-text="name" item-value="_id"
                                  @change="filterChanged" menu-props="offset-y, bottom">
                            <template v-slot:selection="{ item, index }">
                                <span v-if="index === 0">{{ item.name }}</span>
                                <span v-if="index === 1" class="other-count">(+{{ filter.categoryIds.length - 1 }})</span>
                            </template>
                        </v-select>
                    </span>
                </template>
            </table-filter>

            <!-- Data Table -->
            <div class="table-container">
                <v-data-table :headers="headers" :items="expenseTotals" item-key="categoryName" :sort-by.sync="sortBy"
                              :sort-desc.sync="sortDesc" :expanded.sync="expanded" :single-expand="singleExpand"
                              disable-pagination hide-default-footer show-expand must-sort @click:row="rowClicked">
                    <template v-slot:item.categoryName="{ item }">
                        <span v-if="!item.categoryName">Unknown</span>
                        <span v-if="item.categoryName">{{item.categoryName}}</span>
                    </template>
                    <template v-slot:item.totalAmount="{ item }">
                        <span>{{item.totalAmount | formatAmount}}</span>
                    </template>
                    <template v-slot:item.percent="{ item }">
                        <span>{{item.percent| formatAmount}}</span>
                    </template>
                    <template v-slot:no-data>
                        <div>No Data</div>
                    </template>
                    <template v-slot:expanded-item="{ headers, item }">
                        <td colspan="4" class="expanded-area">
                            <table class="subcategory-table">
                                <tbody>
                                <tr v-for="(subcat, idx) in item.subcategoryTotals" :key="idx">
                                    <td></td>
                                    <td>{{subcat.subcategoryName || 'Unknown'}}</td>
                                    <td class="subcategory-amount text-right">{{subcat.totalAmount | formatAmount}}</td>
                                </tr>
                                </tbody>
                            </table>
                            <div v-if="!item.subcategoryTotals.length" class="no-subcategories">
                                No Subcategory Data
                            </div>
                        </td>
                    </template>
                </v-data-table>
            </div>
            <div class="table-footer" style="position: relative;">
                <v-toolbar flat dense>
                    <span>{{expenseTotals.length}} {{rowText}}</span>
                    <v-spacer></v-spacer>
                    <span>Total Amount: {{totalExpensesAmount | formatAmount}}</span>
                </v-toolbar>
            </div>
        </div>

        <!-- Snack Msg -->
        <snack-msg ref="snack" :options="snackOptions"></snack-msg>
    </div>
</template>

<script>
    import ExpenseService from '@/services/expense'
    import CategoryService from '@/services/category'
    import SnackMsg from '@/components/common/SnackMsg.vue'
    import TableFilter from '@/components/common/TableFilter'
    import DateRangeInput from '@/components/common/DateRangeInput'
    import moment from 'moment'
    import PageHeader from '../common/PageHeader.vue'

    export default {
        name: 'ExpenseSummary',

        data() {
            return {
                singleExpand: true,
                expanded: [],
                expenseTotals: [],
                totalExpensesAmount: null,
                selectedExpense: {},
                sortBy: 'categoryName',
                sortDesc: false,
                expenses: [],
                categories: [],
                selectCategories: [],
                filter: {
                    startDate: moment().startOf('year').format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD'),
                    categoryIds: []
                },
                headers: [
                    { value: 'categoryName', text: 'Category' },
                    { value: 'percent', text: 'Percent', align: 'end' },
                    { value: 'totalAmount', text: 'Amount', align: 'end' },
                    { value: 'data-table-expand', text: '' }
                ],
                snackOptions: {
                    show: null,
                    msg: null,
                    color: 'error'
                }
            }
        },

        components: {
            PageHeader,
            SnackMsg,
            TableFilter,
            DateRangeInput
        },

        computed: {
            rowText() {
                return this.expenseTotals.length !== 1 ? 'rows' : 'row'
            }
        },

        methods: {
            /*
             * Retrieve the summarized expense data from the db
             */
            getExpenseTotals() {
                ExpenseService.getExpenseTotals(this.filter).then((expenseTotals) => {
                    this.expenseTotals = expenseTotals

                    // Collapse any expanded row
                    this.expanded.shift()

                    this.totalExpensesAmount = expenseTotals.reduce((sum, cat) => sum + Number(cat.totalAmount), 0)
                }).catch((error) => {
                    console.error('Error retrieving expense totals:', error)
                    this.$refs.snack.show('Error retrieving expense summary data')
                })
            },

            /*
             * Get the categories for the select drop down
             */
            getCategorySelect() {
                return CategoryService.getCategorySelect().then((selectCategories) => {
                    this.selectCategories = selectCategories
                }).catch((error) => {
                    console.error('Error retrieving category select:', error)
                    this.$refs.snack.show('Error retrieving category select data')
                    return Promise.reject(error)
                })
            },

            /*
             * When the filter changes, retrieve the categories and expense data again
             */
            filterChanged() {
                this.getCategorySelect()
                this.getExpenseTotals()
            },

            /*
             * Handle manually expanding/collapsing rows on row click (vs expand icon click)
             */
            rowClicked(item) {
                if (this.expanded.length && this.expanded[0] === item) {
                    this.expanded.shift()
                } else {
                    this.expanded.shift()
                    this.expanded.push(item)
                }
            }
        },

        /*
         * On mount, initialize the filter values and retrieve the categories and expense data
         */
        mounted() {
            this.getCategorySelect()
            this.getExpenseTotals()
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../styles/global.scss';

    .filter-select {
        width: 200px;
    }

    .filter-input.select-input {
        width: 300px !important;
    }

    .no-subcategories {
        padding-left: 24px;
        background-color: #e9e8f4;
    }

    .other-count {
        padding-left: 4px;
    }

    .expanded-area {
        background-color: #e9e8f4;

        .subcategory-table {
            td {
                background-color: #e9e8f4;
            }

            .subcategory-amount {
                padding-right: 58px;
            }
        }
    }

    /* Override Vuetify styling for data table expanded row */
    ::v-deep .v-data-table__expanded__content {
        box-shadow: none !important;
        background-color: #ffffff;
        border-bottom: 0px;
        border-top: solid 2px #cdcdcd;
    }

    ::v-deep .v-data-table__expanded__content table {
        background-color: white;
    }

    ::v-deep .v-data-table__expanded__content > td {
        border-bottom: none !important;
    }
</style>
