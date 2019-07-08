<style scoped lang="scss">
</style>

<template lang="pug">
  overlay-wnd(v-if="showOverlay", @close="close")
    h4.mt-2.text-center {{ $t('.info.title') }}
    hr.mt-0.mb-2

    .container(v-if="overlayItem")
      label.mt-2 {{ $t('models.provider.attributes.name') }}
      span {{ overlayItem.name }}

      label.mt-2 {{ $t('models.provider.attributes.document') }}
      span {{ overlayItem.document }}

      h5.title.mt-2 {{ $t('models.address.one') }}

      label.mt-2 {{ $t('models.address.attributes.address') }}
      span {{ overlayItem.address.address }}

      label.mt-2 {{ $t('models.address.attributes.number') }}
      span {{ overlayItem.address.number }}

      label.mt-2 {{ $t('models.address.attributes.neighborhood') }}
      span {{ overlayItem.address.neighborhood }}

      label.mt-2 {{ $t('models.address.attributes.cityName') }}
      span {{ overlayItem.address.city_name }}

      label.mt-2 {{ $t('models.address.attributes.cep') }}
      span {{ overlayItem.address.cep }}

      label.mt-2 {{ $t('models.address.attributes.complement') }}
      span {{ overlayItem.address.complement || $t('messages.not_informed') }}

      label.mt-2 {{ $t('models.address.attributes.referencePoint') }}
      span {{ overlayItem.address.reference_point }}

      h5.mt-2.title {{ $t('models.legal_representative.one') }}

      label.mt-2 {{ $t('models.legal_representative.attributes.name') }}
      span {{ overlayItem.legal_representative.name }}

      label.mt-2 {{ $t('models.legal_representative.attributes.nationality') }}
      span {{ overlayItem.legal_representative.nationality }}

      label.mt-2 {{ $t('models.legal_representative.attributes.civilState') }}
      span {{ $t('models.legal_representative.attributes.civil_states.' + overlayItem.legal_representative.civil_state) }}

      label.mt-2 {{ $t('models.legal_representative.attributes.rg') }}
      span {{ overlayItem.legal_representative.rg }}

      label.mt-2 {{ $t('models.legal_representative.attributes.cpf') }}
      span {{ overlayItem.legal_representative.cpf }}

      label.mt-2 {{ $t('models.legal_representative.attributes.validUntil') }}
      span {{ overlayItem.legal_representative.valid_until }}
    .container.blink-50(v-else)
      .list-item.o-container
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x
      .list-item.loading-2.o-container
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

      .list-item.loading-3.o-container
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

      .list-item.loading-4.o-container
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

</template>


<script>

  export default {
    props: {
      overlayItem: { type: Object },
      showOverlay: { type: Boolean, default: false }
    },

    data() {
      return {
        i18nScope: 'components.proposal-overlay',
      }
    },

    methods: {
      close() {
        this.$emit('closeOverlay')
      },
    }
  }

</script>
