<style scoped lang="scss">
</style>

<template lang="pug">
  .mt-2
    .container
      .alert.alert-info(v-if="bidding && (bidding.status == 'draft' || bidding.status == 'waiting' || bidding.status == 'approved')")
        | {{ $t('.send.alert') }}

      template(v-if="bidding")
        .card.mb-2(v-if="pendingInvitesCount")
          h4 {{ $t('.pending_title') }}

          hr.mt-2.mb-2.o-container

          ul.mb-0
            li.list-item.o-container.row(v-for="(invite) in pendingInvites")
              invite-list-item(:invite="invite", @click="toggleOverlayInfo(invite)")

              hr.mt-1.mb-1

              .container
                .text-center
                  .button.button-success.mb-0.button-approve-invite(@click="toggleAcceptOverlay(invite)")
                    | {{ $t('.button.approve') }}
                  .button.button-danger.ml-1.mb-0.button-reprove-invite(@click="toggleRefuseOverlay(invite)")
                    | {{ $t('.button.reprove') }}
        .card.mb-2
          h4 {{ $t('.title') }}

          hr.mt-2.mb-2.o-container

          .text-center(v-if="canInvite")
            router-link.button.button-primary.router-link.u-full-width.mb-0.button-edit-invites(:to="{ name: 'editBiddingInvites', params: { id: bidding.id } }")
              | {{ $t('.button.new') }}

            hr.mt-2.mb-2.o-container

          ul.mb-0.blink-50(v-if="isLoading")
            li.list-item.o-container
              .container
                .list-title
                i.fas.fa-spinner.fa-pulse.fa-2x
            li.list-item.loading-2.o-container
              .container
                .list-title
                i.fas.fa-spinner.fa-pulse.fa-2x

            li.list-item.loading-3.o-container
              .container
                .list-title
                i.fas.fa-spinner.fa-pulse.fa-2x

            li.list-item.loading-4.o-container
              .container
                .list-title
                i.fas.fa-spinner.fa-pulse.fa-2x


          ul.mb-0(v-else-if="approvedInvitesCount")
            li.list-item.o-container.row(v-for="(invite) in approvedInvites")
              invite-list-item(:invite="invite", @click="toggleOverlayInfo(invite)")

          ul.mb-0(v-else)
            li.list-item.mb-0
              .container
                | {{ $t('.empty') }}

        .card.mb-2(v-if="reprovedInvitesCount")
          h4 {{ $t('.reproved_title') }}

          hr.mt-2.mb-2.o-container

          ul.mb-0
            li.list-item.o-container.row(v-for="(invite) in reprovedInvites")
              invite-list-item(:invite="invite", @click="toggleOverlayInfo(invite)")

    overlay-wnd(v-if="showAcceptOverlay", @close="showAcceptOverlay = false")
      .container(v-if="acceptOverlayItem")
        h4.mt-2.text-center {{ $t('.overlay.accept.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.overlay.accept.alert') }}


        label.mt-2
          | {{ $t('models.proposal.attributes.provider') }}:
        span
          | {{ this.acceptOverlayItem.provider_name }}

        label.mt-2
          | {{ $t('models.proposal.attributes.document') }}:
        span
          | {{ this.acceptOverlayItem.provider_document }}

        .text-center.mt-2
          .button.button-primary(@click="approveInvite(acceptOverlayItem)")
            | {{ $t('.overlay.accept.button') }}

    overlay-wnd(v-if="showRefuseOverlay", @close="showRefuseOverlay = false")
      .container(v-if="reproveOverlayItem")
        h4.mt-2.text-center {{ $t('.overlay.reprove.title') }}
        hr.mt-0.mb-2.o-container

        .alert.alert-info
          | {{ $t('.overlay.reprove.alert') }}

        label.mt-2
          | {{ $t('models.proposal.attributes.provider') }}:
        span
          | {{ this.reproveOverlayItem.provider_name }}

        label.mt-2
          | {{ $t('models.proposal.attributes.document') }}:
        span
          | {{ this.reproveOverlayItem.provider_document }}

        textarea-field.mt-2(
          v-model="comment",
          name="comment",
          :label.mr-0-5="$t('.overlay.reprove.label')",
          :error="errors.comment"
        )

        .text-center.mt-2
          .button.button-primary(@click="reproveInvite(reproveOverlayItem)")
            | {{ $t('.overlay.reprove.button') }}

    provider-overlay(:overlayItem="overlayItem", :showOverlay="showOverlayInfo", @closeOverlay="showOverlayInfo = false")

</template>

<script>
  import InviteListItem from './_index/invite-list-item.vue'

  export default {
    name: 'invites',

    components: {
      InviteListItem
    },

    data () {
      return {
        i18nScope: 'biddings.invites.index',

        // resource
        bidding: null,
        isLoading: true,

        invites: null,
        groupedInvites: null,

        pendingInvites: null,
        approvedInvites: null,
        reprovedInvites: null,

        pendingInvitesCount: null,
        approvedInvitesCount: null,
        reprovedInvitesCount: null,

        showWaitingOverlay: false,
        showOverlayInfo: false,
        overlayItem: null,

        acceptOverlayItem: null,
        showAcceptOverlay: false,
        reproveOverlayItem: null,
        showRefuseOverlay: false,
        errors: {},
        comment: '',


        params: {},

        tabs: [
          {
            route: { name: 'bidding', params: {} },
            icon: 'fa-file',
            text: this.$t('models.bidding.one'),
            active: false,
          },

          {
            route: { name: 'lots', params: {} },
            icon: 'fa-list',
            text: this.$t('biddings.lots.index.tabs.lots'),
            active: false,
          },

          {
            route: { name: 'invites', params: { bidding_id: null } },
            icon: 'fa-envelope',
            text: this.$t('biddings.lots.index.tabs.invites'),
            active: true,
          }
        ]
      }
    },

    computed: {
      canInvite() {
        let bidding = this.bidding
        let status = bidding.status

        return bidding && _.includes(this.statuses, status)
      },

      statuses() {
        return ["draft", "waiting", "approved", "ongoing"]
      }
    },

    methods: {
      fetch() {
        let params = this.params

        this.isLoading = true

        return this.$http.get('/cooperative/biddings/' + this.biddingId)
          .then((response) => {
            this.bidding = response.data
            return response
          })
          .then((response) => {
            this.getInvites()
          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      getInvites() {
        let params = this.params

        return this.$http.get('/cooperative/biddings/' + this.biddingId + '/invites', { params })
          .then((response) => {

            this.invites = response.data

            this.regroupInvites()

            this.isLoading = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      toggleOverlayInfo(item) {
        this.showOverlayInfo = true
        this.getProvider(item.provider_id)
      },

      toggleAcceptOverlay(invite) {
        this.acceptOverlayItem = invite
        this.showAcceptOverlay = true
      },

      toggleRefuseOverlay(invite) {
        this.reproveOverlayItem = invite
        this.showRefuseOverlay = true
      },

      approveInvite(invite) {
        this.$http.patch('/cooperative/biddings/' + this.biddingId + '/invites/' + invite.id + '/approves', {})
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.invite.approved.success'))

            this.getInvites()

            this.showAcceptOverlay = false
          })
          .catch((err) => {
            console.log(err)
            this.$notifications.error(this.$t('.notifications.invite.approved.failure'))

          })
          .then(() => {
            this.submitting = false
          })
      },

      reproveInvite(invite) {
        let params = { comment: this.comment }

        this.$http.patch('/cooperative/biddings/' + this.biddingId + '/invites/' + invite.id + '/reproves', params)
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.invite.reproved.success'))

            this.showRefuseOverlay = false
            this.comment = ''
            this.getInvites()
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.errors = this.$i18n.errify(errors, { model: 'invite' })

            this.$notifications.error(this.$t('.notifications.invite.reproved.failure'))

          })
          .then(() => {
            this.submitting = false
          })
      },

      regroupInvites() {
        this.groupedInvites = _.groupBy(this.invites, "status")

        this.approvedInvites = this.groupedInvites["approved"] || []
        this.approvedInvitesCount = this.approvedInvites.length

        this.pendingInvites = this.groupedInvites["pending"] || []
        this.pendingInvitesCount = this.pendingInvites.length

        this.reprovedInvites = this.groupedInvites["reproved"] || []
        this.reprovedInvitesCount = this.reprovedInvites.length

      },

      getProvider(providerId) {
        return this.$http.get('/cooperative/providers/' + providerId)
          .then((response) => {
            this.overlayItem = response.data

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
            this.overlayItem = null
            this.showOverlayInfo = false
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)

        this.params = params
      },

      updateTabs() {
        if(this.bidding.kind == 'global') {
          let tab = {
            route: { name: 'globalProposals', params: { bidding_id: this.biddingId } },
            icon: 'fa-list',
            text: this.$t('biddings.invites.show.tabs.proposals'),
            active: false,
          }

          this.tabs.push(tab)
        }
      },

      updateTabsRoutes() {
        this.tabs[0].route.params = { id: this.biddingId }
        this.tabs[1].route.params = { bidding_id: this.biddingId }
        this.tabs[2].route.params = { bidding_id: this.biddingId }
      },

      init() {
        this.parseRoute()
        this.updateTabsRoutes()
        this.fetch()
        this.$emit('tabChanged', this.tabs)
      }
    },

    created: function () {
      this.init();
    },


    watch: {
      showOverlayInfo: function(value) {
        if (! value) {
          this.overlayItem = null
        }
      }
    }
  }

</script>
