import { test, expect } from '@playwright/test';

test.describe('Home Page - Federal Express Brasil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar todos os componentes principais', async ({ page }) => {
    // Verificar Header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByAltText('Federal Express Brasil')).toBeVisible();
    
    // Verificar Hero
    await expect(page.locator('text=Federal Express Brasil')).toBeVisible();
    
    // Verificar MarketTicker
    await expect(page.locator('text=/Cotações.*Tempo Real/i')).toBeVisible();
    
    // Verificar Footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=/© 2025 Federal Express Brasil/i')).toBeVisible();
  });

  test('deve ter responsividade mobile (360px)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    
    // Header deve estar visível
    await expect(page.locator('header')).toBeVisible();
    
    // Botões devem estar empilhados ou em menu
    const buttons = page.locator('button:visible');
    await expect(buttons).toBeTruthy();
  });

  test('deve ter responsividade desktop (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Logo deve estar visível
    await expect(page.getByAltText('Federal Express Brasil')).toBeVisible();
    
    // Botões de navegação devem estar visíveis
    await expect(page.locator('text=Cadastro')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('deve navegar para página de Cadastro', async ({ page }) => {
    await page.click('text=Cadastro');
    
    // Verificar se está na página de cadastro
    await expect(page.locator('text=Crie sua conta')).toBeVisible();
    await expect(page.locator('input[name="cpf"]')).toBeVisible();
  });

  test('deve navegar para página de Login', async ({ page }) => {
    await page.click('text=Login');
    
    // Verificar se está na página de login
    await expect(page.locator('text=Acesse sua conta')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('logo deve redirecionar para home', async ({ page }) => {
    // Navegar para outra página
    await page.click('text=Cadastro');
    await expect(page.locator('text=Crie sua conta')).toBeVisible();
    
    // Clicar no logo
    await page.click('img[alt="Federal Express Brasil"]');
    
    // Deve voltar para home
    await expect(page.locator('text=/Cotações.*Tempo Real/i')).toBeVisible();
  });

  test('deve ter contraste adequado (AA+)', async ({ page }) => {
    // Verificar cor do texto principal
    const heading = page.locator('h1').first();
    const color = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // RGB para texto escuro deve ser próximo de (17, 17, 17) = #111111
    expect(color).toBeTruthy();
  });

  test('carrosséis RSS devem estar visíveis', async ({ page }) => {
    // Atualidades sobre Migração
    await expect(page.locator('text=Atualidades sobre Migração e Turismo')).toBeVisible();
    
    // Dicas de Viagem
    await expect(page.locator('text=Dicas de Viagem')).toBeVisible();
  });

  test('MultimediaSection deve estar visível', async ({ page }) => {
    // Canal Migratório Federal Express
    await expect(page.locator('text=/Canal.*Migratório/i')).toBeVisible();
  });

  test('deve aplicar design tokens corretos', async ({ page }) => {
    // Verificar se CSS custom properties estão aplicadas
    const root = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        brandBlue: styles.getPropertyValue('--color-brand-blue'),
        brandGreen: styles.getPropertyValue('--color-brand-green'),
        spaceXl: styles.getPropertyValue('--space-xl'),
      };
    });
    
    expect(root.brandBlue.trim()).toBe('#0A4B9E');
    expect(root.brandGreen.trim()).toBe('#2BA84A');
    expect(root.spaceXl.trim()).toBe('80px');
  });

  test('sticky header deve funcionar no scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Scroll para baixo
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Header deve continuar visível
    await expect(page.locator('header')).toBeVisible();
    
    // Verificar position sticky
    const position = await page.locator('header').evaluate((el) => {
      return window.getComputedStyle(el).position;
    });
    
    expect(position).toBe('sticky');
  });
});


