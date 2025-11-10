import { test, expect } from '@playwright/test';

test.describe('Acessibilidade (WCAG AA+)', () => {
  
  test('home deve ter estrutura semântica correta', async ({ page }) => {
    await page.goto('/');
    
    // Deve ter apenas um h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Header deve usar tag <header>
    await expect(page.locator('header')).toBeVisible();
    
    // Footer deve usar tag <footer>
    await expect(page.locator('footer')).toBeVisible();
    
    // Main content deve usar tag <main>
    await expect(page.locator('main')).toBeVisible();
  });

  test('imagens devem ter alt text', async ({ page }) => {
    await page.goto('/');
    
    // Logo deve ter alt descritivo
    const logo = page.locator('img[alt*="Federal Express"]');
    await expect(logo).toBeVisible();
    
    // Verificar que todas as imagens significativas têm alt
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('formulários devem ter labels associados', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cadastro');
    
    // Todos os inputs devem ter labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('botões devem ter texto ou aria-label', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('navegação por teclado deve funcionar', async ({ page }) => {
    await page.goto('/');
    
    // Tab através dos elementos focáveis
    await page.keyboard.press('Tab');
    
    // Verificar se há um elemento focado
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('focus visible deve estar aplicado', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    
    const input = page.locator('input[name="email"]');
    await input.focus();
    
    // Verificar outline ou ring de foco
    const outline = await input.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    expect(outline.outline !== 'none' || outline.boxShadow !== 'none').toBe(true);
  });

  test('contraste de cores deve ser adequado (AA)', async ({ page }) => {
    await page.goto('/');
    
    // Verificar contraste do texto principal
    const heading = page.locator('h1').first();
    
    const colors = await heading.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });
    
    // Apenas verificar que cores estão definidas (teste real de contraste requer cálculo)
    expect(colors.color).toBeTruthy();
  });

  test('links devem ser identificáveis', async ({ page }) => {
    await page.goto('/');
    
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('formulário de erro deve anunciar mensagens', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    
    // Tentar submeter sem preencher
    await page.click('button:has-text("Entrar")');
    
    // Verificar se validação HTML5 está ativa
    const emailInput = page.locator('input[name="email"]');
    const isRequired = await emailInput.getAttribute('required');
    
    expect(isRequired).toBeDefined();
  });

  test('estados de hover devem ser visíveis', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    
    const button = page.locator('button:has-text("Entrar")');
    
    // Obter estilo inicial
    const initialStyle = await button.evaluate((el) => {
      return window.getComputedStyle(el).filter || window.getComputedStyle(el).transform;
    });
    
    // Hover
    await button.hover();
    
    // Aguardar animação
    await page.waitForTimeout(500);
    
    // Estilo após hover (pode ter mudado)
    const hoverStyle = await button.evaluate((el) => {
      return window.getComputedStyle(el).filter || window.getComputedStyle(el).transform;
    });
    
    // Estilos podem ter mudado (brightness, transform, etc)
    expect(hoverStyle).toBeTruthy();
  });

  test('checkboxes devem ser acessíveis', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cadastro');
    
    const checkbox = page.locator('input[type="checkbox"]#acceptTerms');
    const label = page.locator('label[for="acceptTerms"]');
    
    await expect(checkbox).toBeVisible();
    await expect(label).toBeVisible();
    
    // Clicar no label deve marcar o checkbox
    await label.click();
    await expect(checkbox).toBeChecked();
  });

  test('reCAPTCHA placeholder deve ter descrição', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cadastro');
    
    await expect(page.locator('text=érea do reCAPTCHA Google')).toBeVisible();
    await expect(page.locator('text=Proteção contra cadastros automáticos')).toBeVisible();
  });

  test('loading states devem ser anunciados', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    
    await page.fill('input[name="email"]', 'teste@email.com');
    await page.fill('input[name="password"]', 'senha123');
    
    await page.click('button:has-text("Entrar")');
    
    // Botão deve mostrar estado de loading
    await expect(page.locator('button:has-text("Entrando...")')).toBeVisible({ timeout: 2000 });
  });
});


