<style scoped lang="scss">
  .link-container {
    cursor: pointer;
  }

</style>

<template lang="pug">
  .container.link-container(v-if="invite", @click="$emit('click')")
    div
      label.mr-0-5.inline-block.list-span.mr-1
        | {{ $t('models.provider.one') }}:
      span
        | {{ invite.provider_name }}
    div
      label.mr-0-5.inline-block.list-span.mr-1
        | {{ $t('models.provider.attributes.document') }}:
      span
        | {{ invite.provider_document }}

</template>

<script>
  export default {
    props: {
      invite: { type: Object }
    },

    data() {
      return {
        i18nScope: 'biddings.invites._index.invite_list_item',
      }
    },
  }
</script>
