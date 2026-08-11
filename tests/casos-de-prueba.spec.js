import { test, expect } from '@playwright/test'

test.describe('Pruebas Automatizadas E2E - Rescata (Caja Negra)', () => {
  const validAddress =
    'Av. Paseo de la Reforma 222, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX'

  async function fillInput(page, selector, value) {
    const input = page.locator(selector)
    await input.focus()
    await input.fill(value)
    await input.dispatchEvent('input')
    await input.dispatchEvent('change')
    await input.blur()
  }

  async function checkCheckbox(page, selector) {
    const checkbox = page.locator(selector)
    const isChecked = await checkbox.isChecked()
    if (!isChecked) {
      await checkbox.click()
    }
  }

  test.describe('Caso 1: Autenticación y Registro de Usuarios (Caja Negra)', () => {
    test('1.1 Validación de formato de correo electrónico inválido', async ({ page }) => {
      await page.goto('/login')

      await fillInput(page, '#correo', 'correo-invalido')

      const errorMsg = page.getByText('Ingresa un correo válido')
      await expect(errorMsg).toBeVisible()

      const submitBtn = page.locator('button.login-submit-btn')
      await submitBtn.click()
      await expect(errorMsg).toBeVisible()
    })

    test('1.2 Credenciales incorrectas muestra mensaje de error global', async ({ page }) => {
      await page.goto('/login')

      await fillInput(page, '#correo', 'josemaria@gmail.com')
      await fillInput(page, '#contrasena', 'Password123!jos')

      const submitBtn = page.locator('button.login-submit-btn')
      await submitBtn.click()

      const globalError = page.locator('.login-global-error, [role="alert"]')
      await expect(globalError).toBeVisible({ timeout: 15000 })
      await expect(globalError).toContainText(/Correo o contraseña incorrectos|error/i)
    })

    test('1.3 Registro de Consumidor e inicio de sesión exitoso', async ({ page }) => {
      const email = `fatimaconsumidor_${Date.now()}@test.com`
      await page.goto('/register')

      await fillInput(page, '#nombre', 'Fatima Consumidor')
      await fillInput(page, '#correo', email)
      await fillInput(page, '#contrasena', 'Password123!')
      await fillInput(page, '#confirmacionContrasena', 'Password123!')
      await checkCheckbox(page, '#consentimientoPrivacidad')

      const submitBtn = page.locator('button.register-submit-btn')
      await submitBtn.click()

      await expect(page).toHaveURL(/\/explore|\/login/, { timeout: 15000 })
    })

    test('1.4 Registro de Negocio e inicio de sesión exitoso', async ({ page }) => {
      const email = `negocio_${Date.now()}@test.com`
      await page.goto('/register')

      await fillInput(page, '#nombre', 'Carlos Negocio')
      await fillInput(page, '#correo', email)
      await fillInput(page, '#contrasena', 'Password123!')
      await fillInput(page, '#confirmacionContrasena', 'Password123!')
      await checkCheckbox(page, '#registrarComoNegocio')
      await checkCheckbox(page, '#consentimientoPrivacidad')

      const step1Btn = page.locator('button.register-submit-btn')
      await step1Btn.click()

      await fillInput(page, '#nombreNegocio', 'Panaderia El Sol')
      await fillInput(page, '#direccionNegocio', validAddress)

      const catSelect = page.locator('#categoriaNegocio')
      await catSelect.selectOption('panaderia')

      const step2Btn = page.locator('button.step2-submit-btn')
      await step2Btn.click()

      await expect(page).toHaveURL(/\/negocio\/dashboard|\/explore|\/login/, { timeout: 15000 })
    })
  })

  test.describe('Caso 2: Publicación de un nuevo producto por un Negocio', () => {
    test('2.1 Negocio llena formulario y publica oferta exitosamente', async ({ page }) => {
      const email = `negocio_pub_${Date.now()}@test.com`

      await page.goto('/register')

      await fillInput(page, '#nombre', 'Carlos Negocio Pub')
      await fillInput(page, '#correo', email)
      await fillInput(page, '#contrasena', 'Password123!')
      await fillInput(page, '#confirmacionContrasena', 'Password123!')
      await checkCheckbox(page, '#registrarComoNegocio')
      await checkCheckbox(page, '#consentimientoPrivacidad')

      const step1Btn = page.locator('button.register-submit-btn')
      await step1Btn.click()

      await fillInput(page, '#nombreNegocio', 'Panaderia Pub')
      await fillInput(page, '#direccionNegocio', validAddress)

      const catSelect = page.locator('#categoriaNegocio')
      await catSelect.selectOption('panaderia')

      const step2Btn = page.locator('button.step2-submit-btn')
      await step2Btn.click()

      await expect(page).toHaveURL(/\/negocio\/dashboard|\/explore|\/login/, { timeout: 15000 })

      await page.goto('/negocio/publicar')
      await expect(page.locator('#nombre')).toBeVisible({ timeout: 15000 })

      await fillInput(page, '#nombre', 'Paquete de Donas Surtidas')
      await fillInput(
        page,
        '#descripcion',
        'Donas frescas del día rescatadas antes de su caducidad.'
      )
      await fillInput(page, '#precioOriginal', '120.00')
      await fillInput(page, '#precioOferta', '40.00')
      await fillInput(page, '#cantidadDisponible', '5')

      const manana = new Date()
      manana.setDate(manana.getDate() + 2)
      const fechaIso = manana.toISOString().split('T')[0]
      await fillInput(page, '#fechaCaducidad', fechaIso)

      const publishBtn = page.locator('button.publish-submit-btn')
      await expect(publishBtn).toBeVisible({ timeout: 5000 })
      await publishBtn.click()

      const toast = page.locator('.toast, div:has-text("¡Producto publicado correctamente!")')
      await expect(toast.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Caso 3: Validación de Reglas de Negocio y Valores Límite (Caja Negra)', () => {
    test('3.1 Validación de Regla de Negocio: El precio de oferta debe ser menor al precio original', async ({
      page,
    }) => {
      const email = `negocio_val_${Date.now()}@test.com`

      await page.goto('/register')

      await fillInput(page, '#nombre', 'Carlos Negocio Val')
      await fillInput(page, '#correo', email)
      await fillInput(page, '#contrasena', 'Password123!')
      await fillInput(page, '#confirmacionContrasena', 'Password123!')
      await checkCheckbox(page, '#registrarComoNegocio')
      await checkCheckbox(page, '#consentimientoPrivacidad')

      const step1Btn = page.locator('button.register-submit-btn')
      await step1Btn.click()

      await fillInput(page, '#nombreNegocio', 'Panaderia Val')
      await fillInput(page, '#direccionNegocio', validAddress)

      const catSelect = page.locator('#categoriaNegocio')
      await catSelect.selectOption('panaderia')

      const step2Btn = page.locator('button.step2-submit-btn')
      await step2Btn.click()

      await expect(page).toHaveURL(/\/negocio\/dashboard|\/explore|\/login/, { timeout: 15000 })

      await page.goto('/negocio/publicar')
      await expect(page.locator('#nombre')).toBeVisible({ timeout: 15000 })

      await fillInput(page, '#nombre', 'Paquete con precio inválido')
      await fillInput(
        page,
        '#descripcion',
        'Descripción de prueba para validación de precio de oferta'
      )
      await fillInput(page, '#precioOriginal', '50.00')
      await fillInput(page, '#precioOferta', '100.00') // Inválido: oferta >= original
      await fillInput(page, '#cantidadDisponible', '5')

      const manana = new Date()
      manana.setDate(manana.getDate() + 2)
      const fechaIso = manana.toISOString().split('T')[0]
      await fillInput(page, '#fechaCaducidad', fechaIso)

      await page.locator('.publish-form').evaluate((form) => form.requestSubmit())

      const errorMsg = page.getByText('El precio de oferta debe ser menor al precio original')
      await expect(errorMsg).toBeVisible({ timeout: 10000 })

      const publishBtn = page.locator('button.publish-submit-btn')
      await expect(publishBtn).toBeDisabled()
    })

    test('3.2 Validación de Valores Límite y Fechas: Precio mayor a cero y Fecha futura', async ({
      page,
    }) => {
      const email = `negocio_lim_${Date.now()}@test.com`

      await page.goto('/register')

      await fillInput(page, '#nombre', 'Carlos Negocio Lim')
      await fillInput(page, '#correo', email)
      await fillInput(page, '#contrasena', 'Password123!')
      await fillInput(page, '#confirmacionContrasena', 'Password123!')
      await checkCheckbox(page, '#registrarComoNegocio')
      await checkCheckbox(page, '#consentimientoPrivacidad')

      const step1Btn = page.locator('button.register-submit-btn')
      await step1Btn.click()

      await fillInput(page, '#nombreNegocio', 'Panaderia Lim')
      await fillInput(page, '#direccionNegocio', validAddress)

      const catSelect = page.locator('#categoriaNegocio')
      await catSelect.selectOption('panaderia')

      const step2Btn = page.locator('button.step2-submit-btn')
      await step2Btn.click()

      await expect(page).toHaveURL(/\/negocio\/dashboard|\/explore|\/login/, { timeout: 15000 })

      await page.goto('/negocio/publicar')
      await expect(page.locator('#nombre')).toBeVisible({ timeout: 15000 })

      // Ingresar precio $0.00 e ingresar fecha pasada (2020-01-01)
      await fillInput(page, '#nombre', 'Galleta de chocolate')
      await fillInput(page, '#descripcion', 'Descripción de prueba para valores límite')
      await fillInput(page, '#precioOriginal', '0.00') // Límite inválido (debe ser > 0)
      await fillInput(page, '#precioOferta', '0.00')
      await fillInput(page, '#cantidadDisponible', '5')
      await fillInput(page, '#fechaCaducidad', '2020-01-01') // Fecha pasada inválida

      await page.locator('.publish-form').evaluate((form) => form.requestSubmit())

      // Verificar mensajes de error de valores límite y fecha
      const priceError = page.getByText('El precio debe ser mayor a cero')
      await expect(priceError.first()).toBeVisible({ timeout: 10000 })

      const dateError = page.getByText('La fecha debe ser futura')
      await expect(dateError).toBeVisible({ timeout: 10000 })

      const publishBtn = page.locator('button.publish-submit-btn')
      await expect(publishBtn).toBeDisabled()
    })
  })
})
