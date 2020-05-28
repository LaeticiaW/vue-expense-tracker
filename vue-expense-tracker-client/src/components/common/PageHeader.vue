<template>
    <!-- Common page header -->
    <div class="page-title">{{title}}</div>
</template>

<script>
    export default {
        name: 'PageHeader',

        props: {
            title: {
                type: String,
                required: true
            }
        }
    }
</script>

<style lang="scss" scoped>
    .page-title {
        font-size: 1.25rem;
        font-weight: bold;
        padding: 0px 8px 8px 0px;

    }
</style>
