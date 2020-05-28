<template>
    <div class="page">
        <page-header title="Manage Expenses"/>

        <div class="page-content table-content">
            <!-- Filter -->
            <table-filter>
                <template v-slot:inputs>

                    <!-- Start and end dates -->
                    <date-range-input :date-range="filter" @date-range-changed="filterChanged"></date-range-input>

                    <!-- Category -->
                    <span class="filter-input">
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

                <template v-slot:actions>
                    <v-btn small dark @click="showAddExpenseDialog" color="primary" title="Create New Expense"
                           class="icon-btn create-expense-btn">
                        <v-icon small>{{'mdi-plus'}}</v-icon>
                    </v-btn>
                </template>
            </table-filter>

            <!-- Data Table -->
            <div class="table-container">
                <v-data-table :headers="headers" :items="expenses" item-key="_id"
                              :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                              @click:row="rowClicked" disable-pagination hide-default-footer must-sort>
                    <template v-slot:item.amount="{ item }">
                        <span>{{item.amount | formatAmount}}</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-icon small color="primary" class="mr-3" @click="updateExpense(item)">mdi-pencil</v-icon>
                        <v-icon small @click="deleteExpense(item)">mdi-delete</v-icon>
                    </template>
                    <template v-slot:no-data>
                        <div>No Data</div>
                    </template>
                </v-data-table>
            </div>
            <div class="table-footer">
                <v-toolbar flat dense>
                    <span>{{expenses.length}} {{rowText}}</span>
                </v-toolbar>
            </div>
        </div>

        <!-- Update Expense Dialog -->
        <expense-dialog v-if="showExpenseDialog" v-model="showExpenseDialog" :expense="selectedExpense"
                        @expense-updated="getExpenses"></expense-dialog>

        <!-- Snack Msg -->
        <snack-msg ref="snack" :options="snackOptions"></snack-msg>
    </div>
</template>

<script>
    import moment from 'moment'
    import ExpenseDialog from '@/components/expenses/ExpenseDialog'
    import ExpenseService from '@/services/expense'
    import CategoryService from '@/services/category'
    import SnackMsg from '@/components/common/SnackMsg'
    import TableFilter from '@/components/common/TableFilter'
    import DateRangeInput from '@/components/common/DateRangeInput'
    import PageHeader from '../common/PageHeader'

    export default {
        name: 'Expenses',

        data() {
            return {
                showExpenseDialog: false,
                selectedExpense: {},
                newExpense: {},
                sortBy: 'trxDate',
                sortDesc: true,
                expenses: [],
                categories: [],
                selectCategories: [],
                filter: {
                    startDate: moment().startOf('year').format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD'),
                    categoryIds: []
                },
                headers: [
                    { value: 'trxDate', text: 'Date', align: 'start' },
                    { value: 'description', text: 'Description' },
                    { value: 'categoryName', text: 'Category' },
                    { value: 'subcategoryName', text: 'Subcategory' },
                    { value: 'amount', text: 'Amount', align: 'end' },
                    { value: 'actions', text: 'Actions', sortable: false }
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
            ExpenseDialog,
            SnackMsg,
            TableFilter,
            DateRangeInput
        },

        computed: {
            rowText() {
                return this.expenses.length !== 1 ? 'rows' : 'row'
            }
        },

        methods: {
            /*
             * Retrieve the expense data
             */
            getExpenses() {
                // Retrieve the expense list
                return ExpenseService.getExpenses(this.filter, this.categoryMap).then((expenses) => {
                    this.expenses = expenses
                }).catch((error) => {
                    console.error('Error retrieving expenses:', error)
                    this.$refs.snack.show('Error retrieving the expense data')
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
             * When a filter value changes, retrieve the expenses again
             */
            filterChanged() {
                this.getCategorySelect()
                this.getExpenses()
            },

            /*
             * When a table row is clicked, save that expense as the selectedExpense
             */
            rowClicked(expense) {
                this.selectedExpense = expense
            },

            /*
             * Display the add expense dialog
             */
            showAddExpenseDialog() {
                this.showExpenseDialog = true
                this.selectedExpense = {
                    trxDate: null,
                    categoryId: null,
                    subcategoryId: null,
                    amount: null
                }
            },

            /*
             * Display the Create/Update Expense dialog
             */
            updateExpense(expense) {
                this.selectedExpense = expense
                this.showExpenseDialog = true
            },

            /*
             * Delete the expense
             */
            deleteExpense(expense) {
                this.$confirm(`Are you sure you want to delete expense ${expense.amount}?`, {
                    title: 'Confirm Delete Expense'
                }).then((confirm) => {
                    if (confirm) {
                        ExpenseService.deleteExpense(expense._id).then(() => {
                            this.getExpenses()
                        }).catch((error) => {
                            console.error('Error deleting expenses:', error)
                            this.$refs.snack.show('Error deleting the expense')
                        })
                    }
                })
            }
        },

        /*
         * On mount, retrieve the expenses
         */
        mounted() {
            this.getCategorySelect()
            this.getExpenses()
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../styles/global.scss';

    .other-count {
        padding-left: 4px;
    }
</style>
