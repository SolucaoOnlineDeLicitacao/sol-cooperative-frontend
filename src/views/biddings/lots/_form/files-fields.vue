<style scoped lang="scss">

  .icon-button {
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
    margin-right: 10px;
  }

  .input-file {
    float: left;
    max-width: 80%;
  }

</style>

<template lang="pug">
  .card.mt-2
    h4.mb-1 {{ $t('.files.title') }}
    hr.mt-0.mb-1.o-container

    .button.u-full-width.button-add-attachment(@click="addAttachment")
      | {{ $t('.files.buttons.add') }}

    .row(v-for="attachment in attachments")
      template(v-if="attachment.visible")
        template(v-if="attachment.url")
          .u-pull-left
            button.button.button-destroy.mb-0.icon-button(type="button" @click="removeAttachment(attachment.id)")
              i.fa.fa-close-thin

          a.input-file.mb-1(:href="attachmentPath(attachment)", target="_blank")
            | {{ attachment.filename }}

          input(type="hidden", name="lot[attachments_attributes][][id]", v-model="attachment.id")

          input(type="hidden", name="lot[attachments_attributes][][_destroy]", v-model="!attachment.visible")

        template(v-else)
          .u-pull-left
            button.button.button-destroy.mb-0.icon-button(type="button" @click="removeAttachment(attachment.id)")
              i.fa.fa-close-thin

          input(type="hidden", name="lot[attachments_attributes][][id]")
          input.input-file(type="file", name="lot[attachments_attributes][][file]")

      template(v-else-if="attachment.url")
        input(type="hidden", name="lot[attachments_attributes][][id]", v-model="attachment.id")
        input(type="hidden", name="lot[attachments_attributes][][_destroy]", v-model="!attachment.visible")

</template>

<script>

  export default {
    props: {
      attachments: { type: Array }
    },

    data() {
      return {
        i18nScope: 'biddings.lots._form.files-fields',
        nextAttachmentId: 0,
      }
    },

    methods: {
      addAttachment() {
        this.attachments.push({
          id: this.nextAttachmentId++,
          visible: true
        })
      },

      removeAttachment(attachmentId) {
        this.attachments.filter(function(elem){
          if(elem.id == attachmentId) elem.visible = false
        });
      },

      attachmentPath(attachment) {
        if(typeof attachment === 'undefined') return
        return app.secrets.api.host + attachment.url
      },

    }
  }

</script>
