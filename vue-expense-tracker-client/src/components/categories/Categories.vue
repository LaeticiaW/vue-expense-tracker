<template>
    <div class="page">
        <page-header title="Categories"/>

        <div class="page-content">
            <!-- Grid layout for single row, two column layout, left column for tree view, right column for details view -->
            <v-row align="start" align-content="start">
                <v-col cols="12" sm="6" md="5">
                    <v-card flat outlined class="category-tree-panel">
                        <!-- Toolbar -->
                        <v-toolbar dense flat color="secondary">
                            <v-spacer></v-spacer>
                            <v-menu offset-y>
                                <template v-slot:activator="{ on }">
                                    <v-btn small dark v-on="on" color="primary" title="Actions" class="icon-btn">
                                        <v-icon small>mdi-dots-vertical</v-icon>
                                    </v-btn>
                                </template>
                                <v-list dense>
                                    <v-list-item @click="showAddCategoryDialog">
                                        <v-list-item-title>Add Category</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item :disabled="!isCategorySelected" @click="showAddSubcategoryDialog">
                                        <v-list-item-title>Add Subcategory</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item :disabled="!isCategorySelected && !isSubcategorySelected"
                                                 @click="deleteItem">
                                        <v-list-item-title>Delete</v-list-item-title>
                                    </v-list-item>
                                    <v-divider/>
                                    <v-list-item @click="expandAllCategories">
                                        <v-list-item-title>Expand All Categories</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="collapseAllCategories">
                                        <v-list-item-title>Collapse All Categories</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-toolbar>
                        <v-card-text>
                            <!-- Category Tree -->
                            <div class="category-tree-wrapper">
                                <v-treeview dense activatable return-object
                                            ref="treeviewRef"
                                            :items="categories"
                                            item-key="treeId"
                                            item-children="subcategories"
                                            :active="activeTreeIds"
                                            color="#454545"
                                            :open="openTreeIds"
                                            @update:active="itemActivated"
                                            @update:open="itemOpened">
                                    <template v-slot:append="{item, leaf, active}">
                                        <v-btn icon v-if="active && !leaf" @click.stop="showAddSubcategoryDialog"
                                               color="primary" title="Add Subcategory">
                                            <v-icon small>{{'mdi-plus'}}</v-icon>
                                        </v-btn>
                                        <v-btn icon v-if="active" @click.stop="deleteItem" color="primary"
                                               title="Delete Category">
                                            <v-icon small>{{'mdi-delete'}}</v-icon>
                                        </v-btn>
                                    </template>
                                </v-treeview>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="7">
                    <!-- Category Details -->
                    <category-details v-if="isCategorySelected"
                                      :category="currentCategory"
                                      @category-updated="refreshCategories"/>

                    <!-- Subcategory Details -->
                    <subcategory-details v-if="isSubcategorySelected"
                                         :category="parentCategory"
                                         :subcategory="currentSubcategory"
                                         @subcategory-updated="refreshCategories"/>
                </v-col>
            </v-row>
        </div>

        <!-- Add Category dialog -->
        <add-category-dialog v-if="showCategoryDialog" v-model="showCategoryDialog"
                             @category-added="categoryAdded"></add-category-dialog>

        <!-- Add Subcategory dialog -->
        <add-subcategory-dialog v-if="showSubcategoryDialog" v-model="showSubcategoryDialog"
                                :category="currentCategory" @subcategory-added="subcategoryAdded"></add-subcategory-dialog>

        <!-- Snack Msg -->
        <snack-msg ref="snack" :options="snackOptions"/>
    </div>
</template>

<script>
    import PageHeader from '@/components/common/PageHeader.vue'
    import CategoryDetails from '@/components/categories/CategoryDetails.vue'
    import SubcategoryDetails from '@/components/categories/SubcategoryDetails.vue'
    import AddCategoryDialog from '@/components/categories/AddCategoryDialog.vue'
    import AddSubcategoryDialog from '@/components/categories/AddSubcategoryDialog.vue'
    import CategoryService from '@/services/category.js'
    import SnackMsg from '@/components/common/SnackMsg.vue'

    export default {
        name: 'Categories',

        data() {
            return {
                categories: [],
                currentCategory: null,
                currentSubcategory: null,
                parentCategory: null,
                activeTreeIds: [],
                openCategoryNames: [],
                openTreeIds: [],
                showCategoryDialog: false,
                showSubcategoryDialog: false,
                maxCategoryId: null,
                snackOptions: {
                    show: null,
                    msg: null,
                    color: 'error'
                }
            }
        },

        components: {
            PageHeader,
            CategoryDetails,
            SubcategoryDetails,
            AddCategoryDialog,
            AddSubcategoryDialog,
            SnackMsg
        },

        computed: {
            isCategorySelected() {
                return this.currentCategory
            },
            isSubcategorySelected() {
                return this.currentSubcategory
            }
        },

        methods: {
            /*
             * Retrieve the categories data
             */
            getCategories() {
                CategoryService.getCategories().then((categories) => {
                    this.categories = categories
                    if (this.categories.length) {
                        // Default the active categories to the first one in the list
                        this.activeTreeIds.push(this.categories[0])
                        this.currentCategory = this.categories[0]
                    }
                }).catch((error) => {
                    console.error('Error retreiving categories:', error)
                    this.$refs.snack.show('Error retrieving categories')
                })
            },

            /*
             * Callback for when a categories or subcategory is selected in the tree
             */
            itemActivated(actives) {
                if (actives && actives.length) {
                    if (this.isSubcategory(actives[0])) {
                        this.currentSubcategory = actives[0]
                        this.parentCategory = this.getParentCategory(this.currentSubcategory)
                        this.currentCategory = null
                    } else {
                        this.currentCategory = actives[0]
                        this.currentSubcategory = null
                        this.parentCategory = null
                    }
                } else if (this.currentCategory) {
                    // Ensure that an item is always activated, do not allow user to deactivate the row that is currently active
                    if (this.currentCategory) {
                        this.activeTreeIds.push(this.currentCategory)
                    } else if (this.currentSubcategory) {
                        this.activeTreeIds.push(this.currentSubcategory)
                    }
                }
            },

            /*
             * Determine if the specified item is a categories or a subcategory
             */
            isSubcategory(item) {
                if (item.parentTreeId !== undefined) {
                    return true
                }
                return false
            },

            /*
             * Keep track of open items
             */
            itemOpened(opened) {
                this.openTreeIds = opened
            },

            /*
             * Display the Add Category dialog
             */
            showAddCategoryDialog() {
                this.showCategoryDialog = true
            },

            /*
             * Refresh the categories list after a new categories is created, and make the new categories
             * the active categories
             */
            categoryAdded(category) {
                this.refreshCategories(category)
            },

            /*
             * Display the Add Subcategory dialog
             */
            showAddSubcategoryDialog() {
                this.showSubcategoryDialog = true
            },

            /*
             * After a new subcategory is created, refresh the categories list
             */
            subcategoryAdded(category, subcategory) {
                this.refreshCategories(category, subcategory)
            },

            /*
             * When the Delete menu item is selected, determine wether to delete a categories or subcategory
             */
            deleteItem() {
                if (this.isSubcategorySelected) {
                    this.deleteSubcategory()
                } else {
                    this.deleteCategory()
                }
            },

            /*
             * Delete the selected Category from the db
             */
            deleteCategory() {
                this.$confirm(`Are you sure you want to delete category ${this.currentCategory.name}?`, {
                    title: 'Confirm Delete Category'
                }).then((res) => {
                    if (res) {
                        CategoryService.deleteCategory(this.currentCategory._id).then(() => {
                            this.refreshCategories()
                        }).catch((error) => {
                            console.error('Error deleting category:', error)
                            console.error('Error deleting category2:', error.data)
                            if (error && error.data && error.data === 'Category in use') {
                                this.$refs.snack.show('Category cannot be deleted because it is already assigned to expenses')
                            } else {
                                this.$refs.snack.show('Error deleting the category')
                            }
                        })
                    }
                })
            },

            /*
             * Delete the subcategory from the categories object and then save/update the categories
             */
            deleteSubcategory() {
                this.$confirm(`Are you sure you want to delete subcategory ${this.currentSubcategory.name}?`, {
                    title: 'Confirm Delete Subcategory'
                }).then((res) => {
                    if (res) {
                        let idx = this.categories.findIndex((cat) => cat.treeId === this.currentSubcategory.parentTreeId)
                        if (idx !== -1) {
                            // Remove the subcategory from the categories object
                            const category = this.categories[idx]
                            idx = category.subcategories.findIndex((subcat) => subcat.treeId === this.currentSubcategory.treeId)
                            if (idx !== -1) {
                                category.subcategories.splice(idx, 1)
                            }

                            // Save the categories to the db
                            CategoryService.updateCategory(category).then((cat) => {
                                this.refreshCategories(cat)
                            }).catch((error) => {
                                console.error('Error deleting subcategory:', error)
                                this.$refs.snac.show('Error deleting the subcategory')
                            })
                        }
                    }
                })
            },

            /*
             * Retrieve the categories list again from the db and reset categories variables.
             * Note that currentCategory and currentSubcategory must contain references to the newly retrieved categories
             */
            refreshCategories(currentCat, currentSubcat) {
                CategoryService.getCategories().then((categories) => {
                    this.categories = categories
                    this.currentCategory = null
                    this.currentSubcategory = null

                    if (currentCat) {
                        // Find the current category in the list
                        const idx = this.categories.findIndex((cat) => cat._id === currentCat._id)
                        if (idx !== -1) {
                            this.currentCategory = this.categories[idx]
                        } else {
                            this.currentCategory = this.categories.length ? this.categories[0] : null
                        }
                    } else {
                        this.currentCategory = this.categories.length ? this.categories[0] : null
                    }

                    if (currentSubcat && this.currentCategory) {
                        // Find the current subcategory in the subcategory list
                        const subIdx = this.currentCategory.subcategories.findIndex((subcat) => subcat.name === currentSubcat.name)
                        if (subIdx !== -1) {
                            this.currentSubcategory = this.currentCategory.subcategories[subIdx]
                            this.parentCategory = this.currentCategory
                            this.currentCategory = null
                        }
                    }

                    // The activeTreeIds and openTreeIds arrays need to be recreated with the categories just retrieved,
                    // so that the object references match.
                    this.activeTreeIds = this.categories.length ? [this.currentCategory] : []

                    this.openTreeIds = this.categories.filter((item) => this.openTreeIds.filter((openItem) => openItem._id === item._id).length > 0)
                }).catch((error) => {
                    console.error('Error retrieving categories:', error)
                    this.$refs.snack.show('Error retrieving the categories')
                })
            },

            /*
             * Return the parent categories for the specified subcategory
             */
            getParentCategory(subcategory) {
                const idx = this.categories.findIndex((cat) => cat.treeId === subcategory.parentTreeId)
                if (idx !== -1) {
                    return this.categories[idx]
                }
                return {}
            },

            /*
             * Expand all categories in the tree
             */
            expandAllCategories() {
                this.$refs.treeviewRef.updateAll(true)
            },

            /*
             * Collapse all categories in the tree
             */
            collapseAllCategories() {
                this.$refs.treeviewRef.updateAll(false)
            }
        },

        /*
         * On create, retrieve the categories data
         */
        created() {
            this.getCategories()
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../styles/global.scss';

    .category-tree-wrapper {
        height: calc(100vh - 240px);
        overflow-y: auto;
    }

    ::v-deep .v-card {
        height: calc(100vh - 170px);
    }

    ::v-deep .v-treeview-node__content {
        cursor: pointer;
    }
</style>
