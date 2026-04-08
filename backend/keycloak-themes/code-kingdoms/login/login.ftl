<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        Code &amp; Kingdoms
    <#elseif section = "form">

        <div id="kc-header-wrapper">
            <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:#8B6914;letter-spacing:2px;margin-top:4px;">
                ⚔ &nbsp; ENTRA AL REINO &nbsp; ⚔
            </span>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin:0 0 18px;">
            <div style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#8B6914 0,#8B6914 4px,transparent 4px,transparent 8px);"></div>
            <div style="width:10px;height:10px;background:#f5d742;transform:rotate(45deg);box-shadow:1px 1px 0 #8B6914;"></div>
            <div style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#8B6914 0,#8B6914 4px,transparent 4px,transparent 8px);"></div>
        </div>

        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">

                <div class="${properties.kcFormGroupClass!}">
                    <label for="username" class="${properties.kcLabelClass!}">
                        <#if !realm.loginWithEmailAllowed>
                            ${msg("username")}
                        <#elseif !realm.registrationEmailAsUsername>
                            ${msg("usernameOrEmail")}
                        <#else>
                            ${msg("email")}
                        </#if>
                    </label>
                    <input tabindex="1" id="username" class="${properties.kcInputClass!}"
                           name="username" value="${(login.username!'')}"
                           type="text" autofocus autocomplete="off"
                           placeholder="Tu nombre de aventurero..."
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                    />
                    <#if messagesPerField.existsError('username','password')>
                        <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="${properties.kcFormGroupClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>
                    <div class="${properties.kcInputGroup!}">
                        <input tabindex="2" id="password" class="${properties.kcInputClass!}"
                               name="password" type="password"
                               autocomplete="current-password"
                               placeholder="Tu contraseña secreta..."
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                        />
                        <button class="${properties.kcFormPasswordVisibilityButtonClass!}" type="button"
                                aria-label="${msg('showPassword')}"
                                aria-controls="password"
                                data-password-toggle
                                data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}"
                                data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                data-label-show="${msg('showPassword')}"
                                data-label-hide="${msg('hidePassword')}">
                            <i class="${properties.kcFormPasswordVisibilityIconShow!}" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div id="kc-form-options" class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <#if realm.rememberMe && !usernameEditDisabled??>
                            <div class="checkbox">
                                <label>
                                    <#if login.rememberMe??>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                    <#else>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                    </#if>
                                </label>
                            </div>
                        </#if>
                    </div>
                    <div>
                        <#if realm.resetPasswordAllowed>
                            <span><a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a></span>
                        </#if>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                    <input type="hidden" id="id-hidden-input" name="credentialId"
                           <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                    <input tabindex="4"
                           class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                           name="login" id="kc-login" type="submit"
                           value=">> ${msg('doLogIn')} <<"/>
                </div>

            </form>
        </#if>

        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration">
                <span>¿Nuevo en las tierras?</span><br>
                <a tabindex="6" href="${url.registrationUrl}">Únete al reino</a>
            </div>
        </#if>

        <div id="kc-info">"Dos reinos. Un destino."</div>

    </#if>
</@layout.registrationLayout>
