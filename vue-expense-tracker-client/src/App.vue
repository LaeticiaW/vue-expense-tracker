<template>
    <v-app>
        <!-- Navigation drawer -->
        <v-navigation-drawer v-model="navDrawerOpen" clipped absolute app hide-overlay temporary>
            <v-list dense nav>
                <v-list-item link v-for="item in navRoutes" :key="item.name" :to="{name: item.name}">
                    <v-list-item-icon>
                        <v-icon>{{item.meta.icon}}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{item.name}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <!-- App bar -->
        <v-app-bar app color="primary" dark>
            <v-app-bar-nav-icon @click.stop="navIconClicked"/>
            <v-toolbar-title>Expense Tracker</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-app-bar>

        <!-- Content area/Router View -->
        <v-content>
            <v-container fluid class="content-container">
                <router-view :key="$route.fullPath"/>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
    import { Routes } from './router/index.js'

    export default {
        name: 'App',

        data() {
            return {
                navDrawerOpen: null
            }
        },

        computed: {
            navRoutes() {
                // only return routes that should show up in the navigation drawer
                return Routes.filter((route) => !route.meta.hidden)
            }
        },

        methods: {
            /*
             * Toggle the nav drawer
             */
            navIconClicked() {
                this.navDrawerOpen = !this.navDrawerOpen
            },

            /*
             * Set the Vuetify theme colors
             */
            setThemeColors() {
                this.$vuetify.theme.themes.light.primary = '#005da1'
                this.$vuetify.theme.themes.light.secondary = '#d8ebf7'
                this.$vuetify.theme.themes.light.accent = '#e57200'
                this.$vuetify.theme.themes.light.error = '#bf0d3e'
                this.$vuetify.theme.themes.light.warning = '#ffb81c'
                this.$vuetify.theme.themes.light.info = '#2196F3'
                this.$vuetify.theme.themes.light.success = '#4CAF50'
            }
        },

        /*
         * On create, set the Vuetify theme colors
         */
        created() {
            this.setThemeColors()
        }
    }

</script>

<style lang="scss" scoped>
    @import './styles/global.scss';

    .content-container {
        min-height: calc(100vh - 70px);
    }

    .v-navigation-drawer--temporary.v-navigation-drawer--clipped {
        z-index: 5;
        padding-top: 64px;
    }

    ::v-deep .page {
        margin: 0px 20px 20px 20px;
    }

</style>
