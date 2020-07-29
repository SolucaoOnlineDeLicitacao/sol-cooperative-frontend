<style scoped lang="scss">
</style>

<template lang="pug">
  .root
    .container.bidding.mt-2(v-if="covenantsCount > 0")
      form(ref="form", method="post", @submit.prevent="submit")
        textarea-field(
          type="text",
          v-model="bidding.description",
          name="bidding[description]",
          :error="errors.description",
          require=true
        )

        select-field(
          name="bidding[covenant_id]",
          model="bidding",
          v-model="bidding.covenant",
          :options="covenants",
          :error="errors.covenant",,
          require=true
        )

        select-field(
          v-if="classificationsCount > 0",
          name="bidding[classification_id]",
          model="bidding",
          v-model="bidding.classification",
          :options="classifications",
          :error="errors.classification",,
          require=true
        )

        input-field(
          type="date",
          v-model="bidding.start_date",
          name="bidding[start_date]",
          :error="errors.start_date",
          require=true
        )

        input-field(
          type="date",
          v-model="bidding.closing_date",
          name="bidding[closing_date]",
          :error="errors.closing_date",
          require=true
        )

        input-field(
          type="number",
          v-model="bidding.draw_end_days",
          name="bidding[draw_end_days]",
          :error="errors.draw_end_days",
          require=true
        )

        input-field(
          type="number",
          v-model="bidding.deadline",
          name="bidding[deadline]",
          :error="errors.deadline",
          require=true
        )

        input-field(
          type="text",
          v-model="bidding.address",
          name="bidding[address]",
          :error="errors.address"
        )

        select-field(
          name="bidding[kind]",
          model="bidding",
          v-model="bidding.kind",
          :options="kinds",
          :error="errors.kind",
          require=true
        )

        select-field(
          name="bidding[modality]",
          model="bidding",
          v-model="bidding.modality",
          :options="modalities",
          :error="errors.modality",
          require=true
        )


        input-field(
          type="text",
          v-model="bidding.link",
          name="bidding[link]",
          :error="errors.link"
        )

        button.button-submit.button-long.u-full-width(
          type="submit",
          :disabled="submitting"
        )
          | {{ submitText }}

    .container.bidding.mt-2(v-else-if="covenantsCount == 0")
      div.alert.alert-warning.mb-2
        | {{ $t('.empty_covenants') }}

</template>


<script>

  export default {
    name: 'newBidding',


    data () {
      return {
        i18nScope: 'biddings.new',
        submitting: false,
        errors:  {},

        tabs: [],

        // form
        bidding: {},
        covenants: {},
        classifications: {},
        covenantsCount: null,
        classificationsCount: null
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      },

      kinds() {
        return [
          { id: null, text: this.$t('options.blank') },
          { id: 'unitary', text: this.$t('models.bidding.attributes.kinds.unitary') },
          { id: 'lot', text: this.$t('models.bidding.attributes.kinds.lot') },
          { id: 'global', text: this.$t('models.bidding.attributes.kinds.global') }
        ]
      },

      modalities() {
        return [
          { id: null, text: this.$t('options.blank') },
          { id: 'unrestricted', text: this.$t('models.bidding.attributes.modalities.unrestricted') },
          { id: 'open_invite', text: this.$t('models.bidding.attributes.modalities.open_invite') },
          { id: 'closed_invite', text: this.$t('models.bidding.attributes.modalities.closed_invite') }
        ]
      }
    },

    methods: {
      getCovenants() {
        return this.$http.get('/cooperative/covenants')
          .then((response) => {
            let mapCovenants = _.map(response.data, function(covenant) { return { id: covenant.id, text: covenant.name } });

            this.covenants = _.concat([{ id: null, text: this.$t('options.blank')}], mapCovenants)
            this.covenantsCount = this.covenants.length

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      getClassifications() {
        return this.$http.get('/cooperative/classifications')
          .then((response) => {
            let mapClassifications = _.map(response.data, function(classification) { return { id: classification.id, text: classification.name } });

            this.classifications = _.concat([{ id: null, text: this.$t('options.blank')}], mapClassifications)

            this.classificationsCount = this.classifications.length
          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.post('/cooperative/biddings', formData)
          .then((response) => {
            let biddingId = response.data.bidding.id

            this.$notifications.clear()
            this.errors = {}

            this.$router.replace({ name: 'lots', params: { bidding_id: biddingId } })
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.$notifications.error(this.$t('.notifications.failure'))
            this.errors = this.$i18n.errify(errors, { model: 'bidding' })
          })
          .then(() => {
            this.submitting = false
          })

      },

      changeTabs() {
        this.$emit('tabChanged', this.tabs)
        this.$emit('navbarTitleChanged', this.$t('.title'))
      },
    },

    created: function () {
      this.changeTabs()
      this.getClassifications()
      this.getCovenants()
    }
  }

</script>
