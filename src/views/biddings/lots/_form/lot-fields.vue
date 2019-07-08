<style scoped lang="scss">
</style>

<template lang="pug">
  .card
    h4 {{ $t('.general.title') }}

    input-field(
      :autofocus="true",
      type="text",
      v-model="lot.name",
      name="lot[name]",
      :error="errors.name"
    )

    input-field(
      type="text",
      v-model="lot.deadline",
      name="lot[deadline]",
      :error="errors.deadline"
    )

    input-field(
      type="text",
      v-model="lot.address",
      name="lot[address]",
      :error="errors.address"
    )

</template>

<script>

  export default {
    props: {
      lot: { type: Object },
      errors: { type: Object },
    },

    data() {
      return {
        i18nScope: 'biddings.lots._form.lot-fields',
      }
    },
  }

</script>
