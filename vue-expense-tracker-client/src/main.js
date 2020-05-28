import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import annotations from 'highcharts/modules/annotations'
import drilldown from 'highcharts/modules/drilldown'
import VuetifyConfirm from 'vuetify-confirm'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import GlobalMixin from './mixins/globalMixin'

// Add global mixin and filters to Vue
Vue.mixin(GlobalMixin)
Vue.prototype.$filters = Vue.options.filters

Vue.config.productionTip = false

// Initialize vuetify-confirm
Vue.use(VuetifyConfirm, {
    vuetify,
    buttonTrueText: 'OK',
    buttonFalseText: 'Cancel',
    color: 'warning',
    icon: 'mdi-warning',
    width: 350,
    property: '$confirm'
})

// Initialize Highcharts
Vue.use(HighchartsVue)
annotations(Highcharts)
drilldown(Highcharts)

// Create the Vue instance and render the App component at #app
new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App)
}).$mount('#app')
