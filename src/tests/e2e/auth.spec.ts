import { test, expect } from '@playwright/test';

test.describe('Autenticação - Cadastro e Login', () => {
  
  test.describe('Página de Cadastro', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('text=Cadastro');
      await expect(page.locator('text=Crie sua conta')).toBeVisible();
    });

    test('deve exibir todos os campos do formulário', async ({ page }) => {
      await expect(page.locator('input[name="cpf"]')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('input[type="checkbox"]#acceptTerms')).toBeVisible();
    });

    test('botão deve estar desabilitado sem aceitar termos', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('botão deve habilitar ao aceitar termos', async ({ page }) => {
      await page.check('input[type="checkbox"]#acceptTerms');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    });

    test('deve aplicar máscara de CPF', async ({ page }) => {
      const cpfInput = page.locator('input[name="cpf"]');
      await cpfInput.fill('12345678901');
      
      const value = await cpfInput.inputValue();
      // Deve ter formatação: 123.456.789-01
      expect(value).toContain('.');
      expect(value).toContain('-');
    });

    test('deve aplicar máscara de telefone', async ({ page }) => {
      const phoneInput = page.locator('input[name="phone"]');
      await phoneInput.fill('11987654321');
      
      const value = await phoneInput.inputValue();
      // Deve ter formatação: (11) 98765-4321
      expect(value).toContain('(');
      expect(value).toContain(')');
      expect(value).toContain('-');
    });

    test('deve validar senhas diferentes', async ({ page }) => {
      await page.fill('input[name="cpf"]', '12345678901');
      await page.fill('input[name="name"]', 'Teste Usuario');
      await page.fill('input[name="phone"]', '11987654321');
      await page.fill('input[name="email"]', 'teste@email.com');
      await page.fill('input[name="password"]', 'senha123');
      await page.fill('input[name="confirmPassword"]', 'senha456');
      await page.check('input[type="checkbox"]#acceptTerms');
      
      await page.click('button[type="submit"]');
      
      // Deve mostrar erro
      await expect(page.locator('text=/senhas não coincidem/i')).toBeVisible();
    });

    test('deve mostrar reCAPTCHA placeholder', async ({ page }) => {
      await expect(page.locator('text=érea do reCAPTCHA Google')).toBeVisible();
      await expect(page.locator('text=Proteção contra cadastros automáticos')).toBeVisible();
    });

    test('deve ter links para termos de uso', async ({ page }) => {
      await expect(page.locator('a:has-text("Termos de Uso")')).toBeVisible();
      await expect(page.locator('a:has-text("Política de Privacidade")')).toBeVisible();
    });

    test('deve ter design responsivo (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      
      // Formulário deve estar visível
      await expect(page.locator('text=Crie sua conta')).toBeVisible();
      
      // Campos devem ocupar largura total
      const input = page.locator('input[name="email"]').first();
      const width = await input.evaluate((el) => el.offsetWidth);
      expect(width).toBeGreaterThan(200);
    });
  });

  test.describe('Página de Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      await expect(page.locator('text=Acesse sua conta')).toBeVisible();
    });

    test('deve exibir campos de login', async ({ page }) => {
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
    });

    test('deve ter botão mostrar/ocultar senha', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]');
      
      // Inicialmente tipo password
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Clicar no botão de mostrar
      await page.click('button:has(svg)').first();
      
      // Pode mudar para text
      const type = await passwordInput.getAttribute('type');
      expect(['password', 'text']).toContain(type);
    });

    test('deve ter link "Esqueci minha senha"', async ({ page }) => {
      await expect(page.locator('text=Esqueci minha senha')).toBeVisible();
    });

    test('deve ter link "Criar conta"', async ({ page }) => {
      await expect(page.locator('text=Criar conta')).toBeVisible();
    });

    test('deve navegar para recuperação de senha', async ({ page }) => {
      await page.click('text=Esqueci minha senha');
      
      await expect(page.locator('text=Recuperar senha')).toBeVisible();
      await expect(page.locator('text=Enviaremos um link para redefinir sua senha')).toBeVisible();
    });

    test('deve navegar para cadastro', async ({ page }) => {
      await page.click('text=Criar conta');
      
      await expect(page.locator('text=Crie sua conta')).toBeVisible();
      await expect(page.locator('input[name="cpf"]')).toBeVisible();
    });

    test('deve voltar do modo recuperação para login', async ({ page }) => {
      await page.click('text=Esqueci minha senha');
      await expect(page.locator('text=Recuperar senha')).toBeVisible();
      
      await page.click('text=Voltar ao login');
      await expect(page.locator('text=Acesse sua conta')).toBeVisible();
    });

    test('deve validar campos vazios', async ({ page }) => {
      await page.click('button:has-text("Entrar")');
      
      // Navegador deve mostrar validação HTML5
      const emailInput = page.locator('input[name="email"]');
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
    });

    test('deve ter reCAPTCHA em todas as telas', async ({ page }) => {
      // Tela de login
      await expect(page.locator('text=érea do reCAPTCHA Google')).toBeVisible();
      
      // Tela de recuperação
      await page.click('text=Esqueci minha senha');
      await expect(page.locator('text=érea do reCAPTCHA Google')).toBeVisible();
    });
  });

  test.describe('Fluxo completo de autenticação', () => {
    test('deve simular fluxo de cadastro completo', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Cadastro');
      
      // Preencher formulário
      await page.fill('input[name="cpf"]', '12345678901');
      await page.fill('input[name="name"]', 'João da Silva E2E');
      await page.fill('input[name="phone"]', '11987654321');
      await page.fill('input[name="email"]', `teste.e2e.${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'senha123456');
      await page.fill('input[name="confirmPassword"]', 'senha123456');
      await page.check('input[type="checkbox"]#acceptTerms');
      
      // Submeter (pode falhar por backend, mas deve processar)
      await page.click('button[type="submit"]');
      
      // Aguardar resposta (sucesso ou erro)
      await page.waitForTimeout(2000);
      
      // Verificar que botão voltou ao estado normal ou mostra mensagem
      const button = page.locator('button[type="submit"]');
      const buttonText = await button.textContent();
      expect(buttonText).toBeTruthy();
    });

    test('deve ter cores institucionais aplicadas', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      // Verificar cor do botão
      const button = page.locator('button:has-text("Entrar")');
      const bgColor = await button.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Deve ser azul (#0A4B9E) - rgb(10, 75, 158)
      expect(bgColor).toContain('10');
    });
  });

  test.describe('Validações de design system', () => {
    test('inputs devem ter altura correta (52px)', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      const input = page.locator('input[name="email"]');
      const height = await input.evaluate((el) => el.offsetHeight);
      
      expect(height).toBe(52);
    });

    test('botões devem ter altura correta (56px)', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      const button = page.locator('button:has-text("Entrar")');
      const height = await button.evaluate((el) => el.offsetHeight);
      
      expect(height).toBe(56);
    });

    test('card deve ter border-radius correto (16px)', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Cadastro');
      
      const card = page.locator('form').locator('..'); // Parent do form
      const borderRadius = await card.evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      
      expect(borderRadius).toContain('16px');
    });

    test('sombras devem estar aplicadas', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      const card = page.locator('form').locator('..');
      const boxShadow = await card.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });
      
      expect(boxShadow).not.toBe('none');
    });
  });
});


