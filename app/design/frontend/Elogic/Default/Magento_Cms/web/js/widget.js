define([
    "jquery",
    "mage/translate",
    "mage/url",
    "Magento_Customer/js/customer-data",
    "jquery-ui-modules/widget",
    "validation"
], function (
    $,
    $t,
    urlBuilder,
    customerData,
) {
    'use strict';

    $.widget('vendor.customWidget', {
        _init() {
            console.log(123)

            this.addEventListeners()
        },

        addEventListeners() {
            var self = this;

            // this._on(this.element, {
            //     submit: this.onSubmit.bind(this)
            // })

            self._on(self.element, {
                submit: self.onSubmit
            })
        },

        onSubmit(event) {
            event.preventDefault();

            if(!this.element.validation('isValid')) {
                throw new Error($t('form is not valid'));
            }

            this.sendAjax();
        },

        sendAjax() {
            //https://elogic.test/index.php/rest/all/V1/directory/countries/UA

            return $.ajax({
                url: urlBuilder.build(`rest/all/V1/directory/countries/${this.getCountryId()}`),
                contentType: 'application/json',
                dataType: 'json',
                beforeSend: this.beforeAjax.bind(this),
                error: this.onAjaxError.bind(this),
                success: this.onAjaxSuccess.bind(this),
                complete: this.afterAjax.bind(this),
            })
        },

        getCountryId() {
            return this.element.serializeArray().find(field => field.name === 'country_id').value;
        },

        beforeAjax() {
            $('body').trigger('proccessStart')
        },

        onAjaxError (response) {
            this.showMessage(response.responseJSON.message ?? $t('oops , something goes wrong'));
        },

        onAjaxSuccess(response) {
            this.showMessage($t('glory to %1').replace('%1', response.full_name_english), 'success');
            this.element.find('.input-text').val('')
        },

        afterAjax() {
            $('body').trigger('proccessStop')
        },

        showMessage(text = '', type = 'error') {
            if (!text) return this;

            const section = customerData.get('messages')() ?? {};
            const messages = section.messages ?? [];

            customerData.set('messages', {
                messages: [
                    ...messages,
                    {
                        text,
                        type
                    }
                ]
            })
        }

    });

    return $.vendor.customWidget;
});
