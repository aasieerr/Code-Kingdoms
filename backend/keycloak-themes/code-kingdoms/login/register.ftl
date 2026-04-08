<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>

    <#if section="header">
        REGISTRO
    <#elseif section="form">
        <div id="kc-header-wrapper">
            <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:#8B6914;letter-spacing:2px;margin-top:4px;">
                ⚔ &nbsp; CREA TU HÉROE &nbsp; ⚔
            </span>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin:0 0 18px;">
            <div style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#8B6914 0,#8B6914 4px,transparent 4px,transparent 8px);"></div>
            <div style="width:10px;height:10px;background:#f5d742;transform:rotate(45deg);box-shadow:1px 1px 0 #8B6914;"></div>
            <div style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#8B6914 0,#8B6914 4px,transparent 4px,transparent 8px);"></div>
        </div>

        <form id="kc-register-form" class="kc-form" method="post" action="${url.registrationAction}">

            <div class="pf-v5-c-form__group">
                <label for="firstName" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("firstName")}</span>
                </label>
                <input type="text" id="firstName" name="firstName" value="${(register.formData.firstName!'')}"
                       class="pf-v5-c-form-control" placeholder="Tu primer nombre..."/>
                <#if messagesPerField.existsError('firstName')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="pf-v5-c-form__group">
                <label for="lastName" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("lastName")}</span>
                </label>
                <input type="text" id="lastName" name="lastName" value="${(register.formData.lastName!'')}"
                       class="pf-v5-c-form-control" placeholder="Tu apellido..."/>
                <#if messagesPerField.existsError('lastName')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="pf-v5-c-form__group">
                <label for="email" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("email")}</span>
                </label>
                <input type="email" id="email" name="email" value="${(register.formData.email!'')}"
                       class="pf-v5-c-form-control" placeholder="correo@reino.com"/>
                <#if messagesPerField.existsError('email')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="pf-v5-c-form__group">
                <label for="username" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("username")}</span>
                </label>
                <input type="text" id="username" name="username" value="${(register.formData.username!'')}"
                       class="pf-v5-c-form-control" placeholder="Tu nombre de aventurero..."/>
                <#if messagesPerField.existsError('username')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="pf-v5-c-form__group">
                <label for="password" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("password")}</span>
                </label>
                <input type="password" id="password" name="password" autocomplete="new-password"
                       class="pf-v5-c-form-control" placeholder="Tu contraseña secreta..."/>
                <#if messagesPerField.existsError('password')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="pf-v5-c-form__group">
                <label for="password-confirm" class="pf-v5-c-form__label">
                    <span class="pf-v5-c-form__label-text">${msg("passwordConfirm")}</span>
                </label>
                <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password"
                       class="pf-v5-c-form-control" placeholder="Confirma tu contraseña..."/>
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="pf-v5-c-form__helper-text pf-m-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <div id="kc-form-buttons" class="pf-v5-c-form__group">
                <input class="pf-v5-c-button pf-m-primary pf-m-block" type="submit" value=">> ${msg('doRegister')} <<"/>
            </div>

            <span id="kc-registration">
                ¿Ya tienes cuenta? <a href="${url.loginUrl}">Inicia sesión</a>
            </span>

        </form>
    </#if>

</@layout.registrationLayout>
