<template>
    <div>
        <v-dialog :value="value" width="500" @click:outside="close()">

            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Update Category</v-toolbar-title>
                </v-toolbar>

                <v-card-text class="dialog-content">
                    <v-form ref="form">
                        <div class="dialog-error error--text">{{dialogMessage}}</div>

                        <v-text-field dense outlined maxlength="30"
                                      v-model="tempCategory.name"
                                      label="Category"
                                      required
                                      :rules="nameRules"/>

                        <!--Subcategory List -->
                        <fieldset class="subcategories">
                            <legend>Subcategories</legend>

                            <v-list dense height="150" max-height="150" class="overflow-y-auto">
                                <v-list-item-group v-model="selectedSubcategory" ripple="false">
                                    <v-list-item v-for="(subcat, idx) in tempCategory.subcategories" :key="idx">
                                        <v-list-item-content>
                                            <v-list-item-title>{{subcat.name}}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-btn small icon @click.stop="deleteSubcategory(subcat, idx)"
                                                   color="primary"
                                                   title="Delete Subcategory">
                                                <v-icon small>{{'mdi-delete'}}</v-icon>
                                            </v-btn>
                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>

                        </fieldset>

                        <!-- Subcategory to add -->
                        <div class="new-subcategory-container">
                            <v-spacer/>
                            <v-text-field dense outlined v-model="newSubcategory" label="New Subcategory">
                                <template v-slot:append-outer>
                                    <v-btn dark small @click.stop="addSubcategory" color="primary" title="Add Subcategory"
                                           class="icon-btn">
                                        <v-icon small>{{'mdi-plus'}}</v-icon>
                                    </v-btn>
                                </template>
                            </v-text-field>
                        </div>
                    </v-form>
                </v-card-text>

                <v-divider/>

                <v-card-actions>
                    <v-btn text color="#787878" @click="close">Cancel</v-btn>
                    <v-btn text color="primary" @click="save" :disabled="!tempCategory.name">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snack Msg -->
        <snack-msg :options="snackOptions"/>
    </div>
</template>

<script>
    import CategoryService from '@/services/category.js'
    import SnackMsg from '@/components/common/SnackMsg.vue'

    export default {
        name: 'UpdateCategoryDialog',

        props: {
            // Component v-model property
            value: {
                type: Boolean,
                required: true
            },
            category: {
                type: Object,
                required: true
            }
        },

        data() {
            return {
                selectedSubcategory: undefined,
                nameRules: [
                    (value) => !!value || 'Category Name is required',
                    () => {
                        this.dialogMessage = null
                        return this.isCategoryUnique || 'Category Name is not unique'
                    }
                ],
                newSubcategory: undefined,
                tempCategory: undefined,
                isCategoryUnique: true,
                dialogMessage: null,
                snackOptions: {
                    show: null,
                    msg: null,
                    color: 'primary'
                }
            }
        },

        components: {
            SnackMsg
        },

        methods: {
            /*
             * Save the Category to the db
             */
            save() {
                this.dialogMessage = null
                this.isCategoryUnique = true
                CategoryService.updateCategory(this.tempCategory).then(() => {
                    this.category.name = this.tempCategory.name
                    this.category.subcategories = this.tempCategory.subcategories
                    this.$emit('category-updated', this.category)

                    // Close the dialog
                    this.close()
                }).catch((error) => {
                    if (error && error.data && error.data.errmsg && error.data.errmsg.indexOf('duplicate') !== -1) {
                        this.isCategoryUnique = false
                        this.$refs.form.validate()
                    } else {
                        console.error('Error saving category:', error)
                        this.dialogMessage = 'Error saving the Category'
                    }
                })
            },

            /*
             * Close the dialog
             */
            close() {
                this.$emit('input', false)
            },

            /*
             * Add the new subcategory to the list of subcategories
             */
            addSubcategory() {
                this.dialogMessage = null
                if (!this.newSubcategory) {
                    return
                }

                const subcat = {
                    name: this.newSubcategory,
                    parentTreeId: this.tempCategory.id,
                    matchText: []
                }

                this.tempCategory.subcategories.push(subcat)
                this.newSubcategory = undefined

                this.sortArray(this.tempCategory.subcategories, 'name')
            },

            /*
             * Delete the subcategory from the list
             */
            deleteSubcategory(subcat, idx) {
                this.dialogMessage = null
                this.tempCategory.subcategories.splice(idx, 1)
            }
        },

        /*
         * On create, make a deep copy of the category for form use
         */
        created() {
            this.tempCategory = JSON.parse(JSON.stringify(this.category))
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../styles/global.scss';

    .subcategories {
        padding: 8px;
        border-radius: 5px;
        border: solid 1px #9a9a9a;
    }
    .new-subcategory-container {
        padding-top: 16px;
    }
    ::v-deep .v-list-item__action {
        margin: 6px 0px !important;
    }
</style>
