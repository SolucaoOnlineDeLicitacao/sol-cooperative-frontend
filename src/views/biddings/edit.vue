<style scoped lang="scss">
</style>

<template lang="pug">
  .root
    .container.bidding.mt-2(v-if="bidding")
      form(ref="form", method="patch", @submit.prevent="submit")
        textarea-field(
          type="text",
          v-model="bidding.description",
          name="bidding[description]",
          :error="errors.description"
        )

        input-field(
          type="date",
          v-model="bidding.start_date",
          name="bidding[start_date]",
          :error="errors.start_date"
        )

        input-field(
          type="date",
          v-model="bidding.closing_date",
          name="bidding[closing_date]",
          :error="errors.closing_date"
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
          :error="errors.deadline"
        )

        input-field(
          type="text",
          v-model="bidding.address",
          name="bidding[address]",
          :error="errors.address"
        )

        input-field(
          type="text",
          v-model="bidding.link",
          name="bidding[link]",
          :error="errors.link"
        )

        button.button-primary.u-full-width(
          type="submit",
          :disabled="submitting"
        )
          | {{ submitText }}
</template>


<script>

  export default {
    name: 'editBidding',

    props: {
      redirect: { type: String }
    },

    data () {
      return {
        i18nScope: 'biddings.edit',
        submitting: false,
        errors:  {},

        tabs: [],

        // form
        bidding: {},
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      }
    },

    methods: {
      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.patch('/cooperative/biddings/' + this.params.id, formData)
          .then((response) => {
            this.$notifications.clear()
            this.errors = {}

            this.$router.replace({ name: 'biddings' })
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

      getBidding() {
        return this.$http.get('/cooperative/biddings/' + this.params.id)
          .then((response) => {
            this.bidding = response.data

            this.$emit('navbarTitleChanged', this.bidding.title)
          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.params = params
      },

      changeTabs() {
        this.$emit('tabChanged', this.tabs)
      },
    },

    created: function () {
      this.parseRoute()
      this.getBidding()
      this.changeTabs()
    }
  }

</script>
