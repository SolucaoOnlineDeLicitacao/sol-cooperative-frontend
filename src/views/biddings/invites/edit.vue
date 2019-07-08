<style scoped lang="scss">
  .list-item-name,
  .list-item-action {
    float: left;
  }

  .list-item-name {
    width: 80%;
  }

  .list-item-action {
    width: 20%;
  }

  .fa-info-circle {
    color: $primary-color;
  }

  .used {
    opacity: 0.5;
  }

</style>

<template lang="pug">
  .root
    .container.bidding.mt-2
      form(ref="form", method="patch", @submit.prevent="submit")
        .card
          h4.mb-1 {{ $t('.general.title') }}
          hr.mt-0.mb-1.o-container

          .button.u-full-width.button-add-invite(@click="toggleOverlay" v-if="bidding")
            | {{ $t('.general.button.add') }}

          hr.mt-0.mb-1.o-container

          div.alert.alert-danger.mb-2(v-if="errors.invites")
            | {{ errors.invites }}

          ul.mb-0.o-container(v-if="invites.length > 0")
            li.list-item.row(v-for="(invite, index) in invites" v-if="!invite._destroy")
              .list-item-name.pl-1(@click="toggleOverlayInfo(invite)")
                .row
                  label.inline-block.list-span
                    | {{ $t('models.provider.one') }}:
                  span
                    |  {{ invite.provider_name }}
                .row
                  label.inline-block.list-span
                    | {{ $t('models.provider.attributes.document') }}:
                  span
                    |  {{ invite.provider_document }}

                template(v-if="invite")
                  input(type="hidden", name="bidding[invites_attributes][][id]", :value="invite.id")
                  input(type="hidden", name="bidding[invites_attributes][][_destroy]", :value="invite._destroy")
                  input(type="hidden", name="bidding[invites_attributes][][provider_id]", :value="invite.provider_id")

              .list-item-action.text-center(@click="removeInvite(invite)")
                .button.button-destroy.button-icon
                  i.fa.fa-close-thin.fa-2x

            li.list-item.empty(v-else)
              template(v-if="invite")
                input(type="hidden", name="bidding[invites_attributes][][id]", :value="invite.id")
                input(type="hidden", name="bidding[invites_attributes][][_destroy]", :value="invite._destroy")

        button.button-submit.u-full-width.mt-2(
          type="submit",
          :disabled="submitting"
        )
          | {{ submitText }}

    overlay-wnd(v-if="showOverlay", @close="showOverlay = false")
      .container
        h4.mt-2.text-center {{ $t('.provider.title') }}
        hr.mt-0.mb-2.o-container

        .button.u-full-width.button-filter-provider(@click="showSearchOverlay = true")
          | {{ $t('.provider.filter') }}

        hr.mt-0.mb-2.o-container

        ul.blink-50(v-if="isLoadingOverlay")
          li.list-item.mb-1
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x
          li.list-item.mb-1.loading-2
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.mb-1.loading-3
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.mb-1.loading-4
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

        ul(v-else-if="providersCount > 0")
          li.list-item.mb-1.o-container.row.provider-container(v-for="(provider) in providers" @click="addInvite(provider)")
            .container(:class="provider.used ? 'used' : 'not-used'")
              .row
                label.inline-block.list-span
                  | {{ $t('models.provider.one') }}:
                span
                  |  {{ provider.name }}
              .row
                label.inline-block.list-span
                  | {{ $t('models.provider.attributes.document') }}:
                span
                  |  {{ provider.document }}

            .container(v-if="provider.used")
              .alert.alert-info
                | {{ $t('.provider.taken') }}

        ul(v-else)
          li.mb-1
            .container
              | {{ $t('.item.empty') }}

        .row(v-if="!isLoadingOverlay")
          .twelve.columns
            paginator(
              v-model="page",
              :prev="prevPageLink",
              :next="nextPageLink",
            )

    provider-overlay(:overlayItem="overlayItem", :showOverlay="showOverlayInfo", @closeOverlay="showOverlayInfo = false")

    overlay-wnd(v-if="showSearchOverlay", :level="2", :closeButton="false", @close="showSearchOverlay = false")
      .container.search-container-wrapper
        h4.mt-2.text-center {{ $t('.provider.filter') }}
        hr.mt-0.mb-2.o-container

        multiple-select-badge(
          v-if="classifications",
          @triggerSearch="filterProviders($event)",
          :results="classifications",
          :currentResultList="classificationResults"
        )

</template>


<script>
  import parseLinkHeaders from 'parse-link-header'

  export default {
    name: 'editLot',

    data () {
      return {
        i18nScope: 'biddings.invites.edit',
        submitting: false,
        showOverlay: false,
        showOverlayInfo: false,
        showSearchOverlay: false,
        isLoadingOverlay: true,

        errors:  {},
        lotGroupItemErrors: {},
        addErrors: false,

        params: {},
        search: '',

        covenantId: null,
        bidding: null,
        biddingId: null,

        // form
        group: {},
        invites: null,
        providers: [],
        providersCount: 0,
        invites: [],
        invite: {},
        overlayItem: null,
        tabs: [],

        // form
        lot: {},
        classifications: null,
        classificationResults: [],

        // pagination
        page:          1,
        prevPageLink:  '',
        nextPageLink:  '',
        totalPages:    1,
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      }
    },

    methods: {
      toggleOverlay() {
        this.showOverlay = true

        this.search = ''
        this.classificationResults = []

        this.getProviders()
        this.getClassifications()
      },

      toggleOverlayInfo(item) {
        this.showOverlayInfo = true
        this.getProvider(item.provider_id)
      },

      getClassifications() {
        return this.$http.get('/search/classifications')
          .then((response) => {
            let grouped = _.groupBy(response.data, 'classification_id')
            let headers = grouped["null"]
            let childrenClassifications = []

            headers.filter(function(elem) {
              childrenClassifications.push(grouped[elem.id])
            });

            this.classifications = _.flatten(childrenClassifications)

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
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

      getBidding() {
        return this.$http.get('/cooperative/biddings/' + this.biddingId)
          .then((response) => {
            this.bidding = response.data
            this.covenantId = this.bidding.covenant_id

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      getInvites() {
        return this.$http.get('/cooperative/biddings/' + this.biddingId + '/invites')
          .then((response) => {
            response.data.filter((item) => {
              item._destroy = false
            })

            this.invites = response.data

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      fetchSearch() {
        this.getProviders()
      },

      filterProviders(result) {
        let ids = _.map(result.list, function(c) { return c.id })
        let params = { classification_ids: ids }

        this.classificationResults = result.list

        this.params = Object.assign({}, this.params, params);

        this.getProviders()

        this.showSearchOverlay = false
      },

      getProviders() {
        this.isLoadingOverlay = true

        let params = this.params

        return this.$http.get('/cooperative/providers', { params })
          .then((response) => {
            this.providers = response.data
            this.providersCount = this.providers.length

            let activeInvites = this.invites.filter((invite) => {
              if(!invite._destroy) {
                return invite
              }
            })

            let ids = _.map(activeInvites, 'provider_id')

            this.providers.filter((provider) => {
              if(_.includes(ids, provider.id)) {
                provider.used = true
              }else {
                provider.used = false
              }
            })

            this.updatePagination(response)

            this.isLoadingOverlay = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })

      },

      updatePagination(aResponse) {
        this.page = aResponse.headers['x-page']
        this.totalPages = aResponse.headers['x-total']
        let links = parseLinkHeaders(aResponse.headers.link) || {}

        this.prevPageLink = _.dig(links, 'prev', 'page')
        this.nextPageLink = _.dig(links, 'next', 'page')
      },


      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.patch('/cooperative/biddings/' + this.biddingId, formData)
          .then((response) => {
            this.$notifications.clear()
            this.errors = {}

            this.$router.replace({ name: 'invites', params: { bidding_id: this.biddingId } })
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.$notifications.error(this.$t('.notifications.failure'))
            this.errors = this.$i18n.errify(errors, { model: 'bidding' })

            for(let i = 0; i < errors.invites_errors.length; i++) {
              this.lotGroupItemErrors[i] = this.$i18n.errify(errors.invites_errors[i], { model: 'invite' })
            }

          })
          .then(() => {
            this.submitting = false
          })
      },

      addInvite: function(provider) {
        let alreadyAdd = false
        let wasDestroyedIndex = -1
        let currentItem = provider

        this.showOverlay = false

        this.invites.filter(function(elem, index){
          if(elem.provider_id == currentItem.id) {
            if(elem._destroy) {
              elem._destroy = false
              wasDestroyedIndex = index
            } else {
              alreadyAdd = true
            }
          }
        });

        if(!alreadyAdd) {
          let addParams = { provider_id: currentItem.id, provider_name: currentItem.name, provider_document: currentItem.document, _destroy: false }

          if (wasDestroyedIndex >= 0) {
            this.invites[wasDestroyedIndex]._destroy = false
          } else {
            this.invites.push(addParams)
          }
        }

        this.addErrors = false
      },

      removeInvite(invite) {
        let currentInvite = invite

        this.invites.filter(function(elem){
          if(elem.provider_id == currentInvite.provider_id) {
            elem._destroy = true
          }
        })
      },

      parseRoute() {
        let params = {}

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)
        this.params = params
      },

      changeTabs() {
        this.$emit('tabChanged', this.tabs)
      },
    },

    created: function () {
      this.changeTabs()
      this.parseRoute()
      this.getBidding()
      this.getInvites()
    },

    watch: {
      showOverlayInfo: function(value) {
        if (! value) {
          this.overlayItem = null
        }
      },

      page() {
        this.params = Object.assign({}, this.params, { page: this.page });
        this.getProviders()
      }

    }
  }

</script>
