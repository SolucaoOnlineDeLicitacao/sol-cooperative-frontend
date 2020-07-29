<style scoped lang="scss">
  .badge {
    &.draft,
    &.closed,
    &.waiting {
      background-color: $greyish-brown;
    }

    &.ongoing {
      background-color: $cerulean;
    }

    &.canceled,
    &.failure {
      background-color: $danger-color;
    }

    &.suspended,
    &.under_review {
      background-color: $peach;
    }

    &.approved,
    &.finnished,
    &.accepted {
      background-color: $apple-green;
    }
  }

  .hint {
    color: gray;
    font-size: 80%;
  }

</style>

<template lang="pug">
  .resource-container(v-if="bidding")
    template(v-if="bidding.refuse_comment && bidding.status == 'draft'")
      .alert.alert-warning
        p.mb-1 {{ $t('.reproved.alert') }}
        strong {{ bidding.refuse_comment }}

    .card
      .row
        label {{ $t('models.bidding.attributes.title') }}
        span {{ bidding.title }}

      .row
        label {{ $t('models.bidding.attributes.description') }}
        span {{ bidding.description }}


      .row
        label {{ $t('models.bidding.attributes.covenant') }}
        span {{ bidding.covenant_name }}

      .row
        label {{ $t('models.bidding.attributes.classificationId') }}
        span {{ bidding.classification_name }}

      .row
        label {{ $t('models.bidding.attributes.kind') }}
        span
          | {{ $t('models.bidding.attributes.kinds.' + bidding.kind) }}

      .row
        label {{ $t('models.bidding.attributes.modality') }}
        span
          | {{ $t('models.bidding.attributes.modalities.' + bidding.modality) }}

    .card.mt-2
      .row
        label {{ $t('models.bidding.attributes.status') }}
        span.badge(:class="bidding.status")
          | {{ $t('models.bidding.attributes.statuses.' + bidding.status) }}

    .card.mt-2
      .row
        label {{ $t('models.bidding.attributes.startDate') }}
        span
          | {{ $l('date.formats.default', bidding.start_date) }}

      template(v-if="bidding.status != 'ongoing'")
        .row
          label.mb-0
            | {{ $t('models.bidding.attributes.closingDate') }}
          span
            | {{ $l('date.formats.default', bidding.closing_date) }}

      template(v-else)
        .row(@click="showAdditiveOverlay = true")
          label.mb-0
            | {{ $t('models.bidding.attributes.closingDate') }}
            i.fa.fa-eye.ml-1
          div.hint {{ $t('.additives.hint') }}

          span
            | {{ $l('date.formats.default', bidding.closing_date) }}

      .row
        label.mb-0 {{ $t('models.bidding.attributes.drawEndDays') }}
        div.hint {{ $t('.general.closing_date.hint') }}
        span {{ bidding.draw_end_days }}

      .row
        label {{ $t('models.bidding.attributes.deadline') }}
        span {{ bidding.deadline }}

      .row
        label {{ $t('models.bidding.attributes.address') }}
        span {{ bidding.address || $t('messages.not_informed') }}

    .card.mt-2
      .row
        label {{ $t('models.bidding.attributes.link') }}
        span
          a(:href="bidding.link" v-if="bidding.link")
            | {{ bidding.link }}
          span(v-else)
            | {{ $t('messages.not_informed') }}

      .row
        label {{ $t('.documents.title') }}


        template(v-if="bidding.minute_pdf")
          a.button.u-full-width(:href="biddingAtaPath", target="_blank")
            | {{ $t('.minute.download') }}
        template(v-else)
          div {{ $t('.minute.not_found') }}

        template(v-if="bidding.edict_pdf")
          a.button.u-full-width(:href="biddingEdictPath", target="_blank")
            | {{ $t('.edict.download') }}
        template(v-else)
          div {{ $t('.edict.not_found') }}

    .text-center.mt-2.mb-2.button-group
      router-link.button.button-primary.router-link(:to="{ name: 'editBidding', params: { id: bidding.id } }" v-if="bidding.status == 'draft'")
        | {{ $t('.edit') }}

      .button.button-danger.ml-1(@click="destroyDialog(bidding.id)" v-if="bidding.status == 'draft' || bidding.status == 'waiting'")
        | {{ $t('.delete') }}

      .button.button-danger(@click="toggleCancelOverlay(bidding)" v-else-if="bidding.status != 'suspended' && bidding.status != 'canceled' && !(bidding.cancel_comment && !bidding.comment_response)")
        | {{ $t('.cancel.button') }}

      .row
        button.button-submit(v-if="canFinishFailureBidding" @click="showFailureOverlay = true")
          | {{ $t('.failure.button') }}
        button.button-submit(v-else-if="bidding.can_finish" @click="finishBidding", :disabled="finnishing")
          template(v-if="finnishing")
            i.fa.fa-spinner.fa-spin
          template(v-else)
            | {{ $t('.button.finish') }}

    .card(v-if="bidding.cancel_comment")
      h5 {{ $t('.cancel.card.title') }}
      hr.mt-0.mb-2.o-container
      label {{ $t('.cancel.card.label') }}
      span
        | {{ this.bidding.cancel_comment }}

      label.mt-2 {{ $t('.cancel.card.answer.label') }}
      span
        | {{ this.bidding.comment_response || $t('.cancel.card.answer.placeholder') }}

    overlay-wnd(v-if="newAdditiveOverlay", @close="newAdditiveOverlay = false")
      .container
        h4.mt-2.text-center {{ $t('.additives.new.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.additives.new.alert') }}

        form(ref="form", method="post", @submit.prevent="submit")
          div
          label {{ $t('models.bidding.one') }}
          span {{ bidding.title }}

          div.mt-2
            label {{ $t('models.additive.attributes.from') }}
            span {{ $l('date.formats.default', bidding.closing_date) }}

          input-field.mt-2(
            type="date",
            v-model="additive.to",
            name="additive[to]",
            :error="errors.to",
            require=true
          )

          button.button-submit.u-full-width(
            type="submit",
            :disabled="submitting"
          )
            | {{ submitText }}

    overlay-wnd(v-if="showAdditiveOverlay", @close="showAdditiveOverlay = false")
      .container
        h4.mt-2.text-center {{ $t('.additives.list') }}
        hr.mt-0.mb-2.o-container

        template(v-if="additives.length > 0")
          strong {{ $t('.additives.overlay.title') }}
          div.mt-1(v-for="additive in additives")
            strong.mr-0-5 {{ $t('.additives.overlay.from') }}
            span {{ additive.from }}
            strong.mr-0-5.ml-1 {{ $t('.additives.overlay.to') }}
            span {{ additive.to }}

        template(v-else)
          .alert.alert-info
            | {{ $t('.additives.empty') }}

        .row.mt-2.text-center
          .button(@click="toggleNewOverlay") {{ $t('.additives.overlay.new') }}

    overlay-wnd(v-if="showCancelOverlay", @close="showCancelOverlay = false")
      .container(v-if="cancelOverlayItem")
        h4.mt-2.text-center {{ $t('.cancel.overlay.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.cancel.overlay.alert') }}

        label.mt-2
          | {{ $t('models.bidding.attributes.title') }}:
        span
          | {{ this.cancelOverlayItem.title }}

        textarea-field.mt-2(
          v-model="comment",
          name="comment",
          :label="$t('.cancel.overlay.field.comment.label')",
          :error="errors.comment"
        )

        .text-center.mt-2
          .button.button-danger(@click="cancel(cancelOverlayItem.id)")
            | {{ $t('.cancel.overlay.button.send') }}

    overlay-wnd(v-if="showFailureOverlay", @close="showFailureOverlay = false")
      .container
        h4.mt-2.text-center {{ $t('.failure.overlay.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.failure.overlay.alert', { title: this.bidding.title }) }}

        textarea-field.mt-2(
          v-model="comment",
          name="comment",
          :label="$t('.failure.overlay.field.comment.label')",
          :error="errors.comment"
        )

        .text-center.mt-2
          .button.button-submit(@click="finishFailureBidding")
            | {{ $t('.failure.overlay.button.send') }}

</template>


<script>
  export default {
    name: 'bidding',

    data () {
      return {
        i18nScope: 'biddings.show',
        bidding: null,
        params: null,
        comment: '',
        errors: {},
        additives: null,

        cancelOverlayItem: null,
        showCancelOverlay: false,
        showAdditiveOverlay: false,
        newAdditiveOverlay: false,
        showFailureOverlay: false,

        additive: {},

        // button
        submitting: false,
        finnishing: false,

        tabs: [
          {
            route: { name: 'bidding', params: {} },
            icon: 'fa-file',
            text: this.$t('models.bidding.one'),
            active: true,
          },

          {
            route: { name: 'lots', params: {} },
            icon: 'fa-list',
            text: this.$t('biddings.lots.index.tabs.lots'),
            active: false,
          },

          {
            route: { name: 'invites', params: {} },
            icon: 'fa-envelope',
            text: this.$t('biddings.lots.index.tabs.invites'),
            active: false,
          }
        ]
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      },

      biddingAtaPath() {
        return this.bidding && this.$http.host + "/" + this.bidding.minute_pdf
      },

      biddingEdictPath() {
        return this.bidding && this.$http.host + "/" + this.bidding.edict_pdf
      },

      canFinishFailureBidding() {
        return this.bidding.all_lots_failure && this.bidding.status != 'failure' && this.bidding.status != 'draft'
      }

    },


    methods: {
      getBidding() {
        return this.$http.get('/cooperative/biddings/' + this.params.id)
          .then((response) => {
            this.bidding = response.data
            this.additives = this.bidding.additives
            this.$emit('navbarTitleChanged', this.bidding.title)

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      destroy(id) {
        return this.$http.delete('/cooperative/biddings/' + id)
          .then((_response) => {
            this.$notifications.info(this.$t('.notifications.destroy.success', { id }))
            this.$router.replace({ name: 'biddings' })
          })
          .catch((_err) => {
            this.$notifications.error(this.$t('.notifications.destroy.failure', { id }))
          })
      },

      cancel(id) {
        let params = { comment: this.comment }

        this.$http.post('/cooperative/biddings/' + id + '/cancellation_requests', params)
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.cancel.success'))

            this.getBidding()

            this.showCancelOverlay = false
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.errors = this.$i18n.errify(errors, { model: 'bidding' })

            this.$notifications.error(this.$t('.notifications.cancel.failure'))
          })
      },

      toggleCancelOverlay(bidding) {
        this.cancelOverlayItem = bidding
        this.showCancelOverlay = true
      },

      toggleNewOverlay() {
        this.newAdditiveOverlay = true
        this.showAdditiveOverlay = false
      },

      destroyDialog(id) {
        let message = {
          title: this.$t('.destroy.title'),
          body: this.$t('.destroy.body')
        }

        let options = {
          cancelText: this.$t('dialog.back'),
          okText: this.$t('dialog.destroy'),
          customClass: 'dg-delete'
        }

        this.$dialog.confirm(message, options)
          .then((dialog) => {
            this.destroy(id)
          })
          .catch(function (err) {
            console.log(err)
            console.log('nop!')
          });
      },

      finishPath() {
        let bidding = this.bidding

        if(bidding.status == "reopened") {
          return '/cooperative/biddings/' + bidding.id + '/refinish'
        } else {
          return '/cooperative/biddings/' + bidding.id + '/finish'
        }
      },

      finishBidding() {
        let bidding = this.bidding
        let path = this.finishPath()

        this.finnishing = true

        this.$http.patch(path)
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.finish.success'))

            bidding.can_finish = false
            this.getBidding()
          })
          .catch((err) => {
            this.$notifications.error(this.$t('.notifications.finish.failure'))
          })
          .then(() => {
            this.finnishing = false
          })
      },

      finishFailureBidding() {
        let bidding = this.bidding
        let params = { comment: this.comment }

        this.$http.patch('/cooperative/biddings/' + bidding.id + '/failure', params)
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.finish.success'))

            bidding.can_finish = false
            this.getBidding()
            this.showFailureOverlay = false
          })
          .catch((err) => {
            this.$notifications.error(this.$t('.notifications.finish.failure'))
          })
      },

      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.post('/cooperative/biddings/' + this.params.id + '/additives', formData)
          .then((response) => {
            this.$notifications.clear()
            this.errors = {}

            this.$notifications.info(this.$t('.notifications.additives.success'))

            this.newAdditiveOverlay = false

            this.getBidding()
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.$notifications.error(this.$t('.notifications.additives.failure'))

            this.errors = this.$i18n.errify(errors, { model: 'additive' })

          })
          .then(() => {
            this.submitting = false
          })

      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.params = params
      },

      changeTabs() {
        // add resource id to router tab
        this.tabs[1].route.params = { bidding_id: this.params.id }
        this.tabs[2].route.params = { bidding_id: this.params.id }
        this.$emit('tabChanged', this.tabs)
      }


    },

    created: function () {
      this.parseRoute()
      this.getBidding()
      this.changeTabs()
    }
  }

</script>
