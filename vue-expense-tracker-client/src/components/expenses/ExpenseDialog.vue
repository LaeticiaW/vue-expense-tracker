<template>
    <div v-if="value">
        <v-dialog retain-focus :value="value" width="500" @click:outside="$emit('input', false)"
                  class="expense-dialog">

            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                </v-toolbar>

                <v-divider></v-divider>

                <v-card-text class="dialog-content">
                    <v-form ref="form" v-model="isFormValid">
                        <div class="dialog-error error--text">{{dialogMessage}}</div>

                        <!-- Trx Date -->
                        <v-menu offset-y bottom v-model="trxDateMenu" :close-on-content-click="true"
                                transition="scale-transition" class="form-item">
                            <template v-slot:activator="{ on }">
                                <v-text-field ref="trxDate" outlined readonly dense required
                                              v-model="tempExpense.trxDate" class="trxDate" v-on="on" background-color="#ffffff"
                                              label="Expense Date" :maxlength="10" :rules="[ruleRequired]"
                                              spellcheck="false" autocomplete="off" autofocus></v-text-field>
                            </template>
                            <v-date-picker v-model="tempExpense.trxDate" no-title scrollable header-color="primary">
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="startDateMenu = false">Cancel</v-btn>
                            </v-date-picker>
                        </v-menu>

                        <!-- Description -->
                        <v-text-field dense outlined required v-model="tempExpense.description"
                                      label="Description" class="description"></v-text-field>

                        <!-- Category -->
                        <v-select dense outlined required v-model="tempExpense.categoryId"
                                  :items="categories" item-text="name" item-value="_id" @change="categorySelected"
                                  label="Category" background-color="#ffffff" class="form-item category"
                                  menu-props="offset-y, bottom" :rules="[ruleRequired]"></v-select>

                        <!-- Subcategory -->
                        <v-select dense outlined required v-model="tempExpense.subcategoryId"
                                  :items="subcategories" item-text="name" item-value="id"
                                  label="Subcategory" background-color="#ffffff" class="form-item subcategory"
                                  menu-props="offset-y, bottom" :rules="[ruleRequired]"></v-select>

                        <!-- Amount -->
                        <v-text-field dense outlined required v-model="tempExpense.amount"
                                      label="Amount" class="form-item amount" :rules="[ruleRequired]"></v-text-field>
                    </v-form>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn text color="#787878" @click="close" class="cancel-button">Cancel</v-btn>
                    <v-btn text color="primary" @click="save" class="save-button">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import ExpenseService from '@/services/expense'
    import CategoryService from '@/services/category'
    import moment from 'moment'

    export default {
        name: 'ExpenseDialog',

        props: {
            // Component v-model property
            value: {
                type: Boolean,
                required: true
            },
            expense: {
                type: Object,
                required: true
            }
        },

        data() {
            return {
                isFormValid: undefined,
                isCreate: true,
                trxDateMenu: false,
                tempExpense: {},
                categories: [],
                subcategories: [],
                categoryMap: {},
                dialogMessage: null,
                snackOptions: {
                    show: null,
                    msg: null,
                    color: 'primary'
                }
            }
        },

        computed: {
            dialogTitle() {
                if (this.expense._id === undefined) {
                    return 'Create Expense'
                }
                return 'Update Expense'
            }
        },

        methods: {
            /*
             * Retrieve the categories list, create the categoryMap, set the select categories
             */
            getCategories() {
                CategoryService.getCategories().then((categories) => {
                    this.categories = categories
                    this.categoryMap = this.categories.reduce((map, obj) => {
                        map[obj._id] = obj
                        return map
                    }, {})
                    if (this.tempExpense.categoryId) {
                        this.selectedCategory = this.categoryMap[this.tempExpense.categoryId]
                        this.subcategories = this.selectedCategory.subcategories
                    }
                }).catch((error) => {
                    console.error('Error retrieving categories:', error)
                    this.dialogMessage = 'Error retrieving the categories'
                })
            },

            /*
             * Save the updated expense to the db
             */
            save() {
                if (this.$refs.form.validate()) {
                    ExpenseService.saveExpense(this.tempExpense).then(() => {
                        this.$emit('expense-updated', this.tempExpense)
                        // Close the dialog
                        this.close()
                    }).catch((error) => {
                        console.error('Error saving expense:', error)
                        this.dialogMessage = 'Error saving the expense'
                    })
                }
            },

            /*
             * When a categories is selected, get its subcategories from the categoryMap
             */
            categorySelected(catId) {
                const category = this.categoryMap[catId]
                if (category) {
                    this.subcategories = category.subcategories
                }
            },

            /*
             * Close the dialog
             */
            close() {
                this.$emit('input', false)
            }
        },

        /*
         * On create, retrieve the categories data
         */
        created() {
            // Make a deep copy of the expense object for the form
            this.tempExpense = JSON.parse(JSON.stringify(this.expense))
            if (this.tempExpense.trxDate) {
                this.tempExpense.trxDate = moment(this.tempExpense.trxDate).format('YYYY-MM-DD')
            }

            // Retrieve the categories list
            this.getCategories()
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../styles/global.scss';

    .dialog-error {
        color: #bf0d3e;
        padding-bottom: 16px;
    }

    .dialog-content {
        padding-top: 24px !important;
        padding-bottom: 0px !important;
    }

    .form-item {
        margin: 16px 0px;
    }

</style>
