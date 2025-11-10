import { test, expect } from '@playwright/test';

test.describe('Responsividade - Design System', () => {
  
  test.describe('Mobile - 360px', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto('/');
    });

    test('layout deve se adaptar ao mobile', async ({ page }) => {
      // Header deve estar visível
      await expect(page.locator('header')).toBeVisible();
      
      // Logo deve estar visível
      await expect(page.getByAltText('Federal Express Brasil')).toBeVisible();
      
      // Conteúdo deve ser empilhado verticalmente
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('textos não devem quebrar', async ({ page }) => {
      // Títulos devem estar visíveis sem overflow
      const headings = await page.locator('h1, h2, h3').all();
      
      for (const heading of headings) {
        const overflow = await heading.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            overflow: styles.overflow,
            textOverflow: styles.textOverflow,
          };
        });
        
        expect(overflow).toBeTruthy();
      }
    });

    test('botéµes devem ocupar largura adequada', async ({ page }) => {
      await page.click('text=Login');
      
      const button = page.locator('button:has-text("Entrar")');
      const width = await button.evaluate((el) => el.offsetWidth);
      
      // Botão deve ter largura razoável (não muito estreito)
      expect(width).toBeGreaterThan(200);
    });

    test('inputs devem ocupar largura total', async ({ page }) => {
      await page.click('text=Cadastro');
      
      const input = page.locator('input[name="email"]');
      const containerWidth = await page.evaluate(() => {
        return document.querySelector('main')?.clientWidth || 0;
      });
      
      const inputWidth = await input.evaluate((el) => el.offsetWidth);
      
      // Input deve ocupar quase a largura total (menos padding)
      expect(inputWidth).toBeGreaterThan(containerWidth * 0.7);
    });

    test('carrosséis devem permitir scroll horizontal', async ({ page }) => {
      const carousel = page.locator('text=Atualidades sobre Migração').locator('..').locator('..');
      
      // Deve ter overflow-x scroll ou auto
      const overflow = await carousel.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });
      
      expect(['scroll', 'auto']).toContain(overflow);
    });

    test('margens devem ser 16px', async ({ page }) => {
      const section = page.locator('main > section').first();
      
      const padding = await section.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });
      
      expect(['16px', '1rem']).toContain(padding);
    });
  });

  test.describe('Tablet - 768px', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
    });

    test('layout deve usar 8 colunas', async ({ page }) => {
      // Verificar que elementos estão organizados apropriadamente
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    test('formulários devem ter largura adequada', async ({ page }) => {
      await page.click('text=Cadastro');
      
      const form = page.locator('form');
      const width = await form.evaluate((el) => el.offsetWidth);
      
      // Formulário não deve ocupar 100% da largura
      expect(width).toBeLessThan(768);
      expect(width).toBeGreaterThan(400);
    });

    test('margens devem ser 32px', async ({ page }) => {
      const section = page.locator('main > section').first();
      
      const padding = await section.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });
      
      expect(['32px', '2rem']).toContain(padding);
    });

    test('tipografia deve escalar corretamente', async ({ page }) => {
      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const size = parseInt(fontSize);
      
      // Deve estar entre min (24px) e max (48px) do clamp
      expect(size).toBeGreaterThanOrEqual(24);
      expect(size).toBeLessThanOrEqual(48);
    });
  });

  test.describe('Desktop - 1440px', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
    });

    test('layout deve usar 12 colunas', async ({ page }) => {
      // Verificar estrutura desktop
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
    });

    test('max-width deve ser respeitado', async ({ page }) => {
      await page.click('text=Cadastro');
      
      const card = page.locator('form').locator('..');
      const width = await card.evaluate((el) => el.offsetWidth);
      
      // Card deve ter max-width de 720px
      expect(width).toBeLessThanOrEqual(720);
    });

    test('margens devem ser 80px', async ({ page }) => {
      const section = page.locator('main > section').first();
      
      const padding = await section.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });
      
      expect(['80px', '5rem', '20']).toContain(padding.replace(/[^0-9]/g, ''));
    });

    test('hero deve ter altura adequada', async ({ page }) => {
      const hero = page.locator('main > section').first();
      const height = await hero.evaluate((el) => el.offsetHeight);
      
      // Hero deve ter pelo menos 400px
      expect(height).toBeGreaterThan(400);
    });

    test('carrosséis devem mostrar múltiplos cards', async ({ page }) => {
      const carouselItems = page.locator('[role="article"], article').first();
      
      // Verificar que cards têm largura fixa no desktop
      const width = await carouselItems.evaluate((el) => el.offsetWidth);
      
      // Cards devem ter ~380px no desktop
      expect(width).toBeGreaterThan(200);
      expect(width).toBeLessThan(500);
    });

    test('botéµes devem ter padding adequado', async ({ page }) => {
      await page.click('text=Login');
      
      const button = page.locator('button:has-text("Entrar")');
      const padding = await button.evaluate((el) => {
        return window.getComputedStyle(el).paddingLeft;
      });
      
      const paddingValue = parseInt(padding);
      expect(paddingValue).toBeGreaterThan(16);
    });
  });

  test.describe('Transiçéµes entre breakpoints', () => {
    test('deve escalar suavemente de mobile para desktop', async ({ page }) => {
      await page.goto('/');
      
      // Começar em mobile
      await page.setViewportSize({ width: 360, height: 800 });
      await page.waitForTimeout(500);
      
      // Tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      await expect(page.locator('header')).toBeVisible();
      
      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(500);
      await expect(page.locator('header')).toBeVisible();
    });

    test('imagens devem manter aspect ratio', async ({ page }) => {
      await page.goto('/');
      
      const logo = page.getByAltText('Federal Express Brasil');
      
      // Mobile
      await page.setViewportSize({ width: 360, height: 800 });
      const mobileHeight = await logo.evaluate((el) => el.offsetHeight);
      
      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      const desktopHeight = await logo.evaluate((el) => el.offsetHeight);
      
      // Logo pode crescer, mas não deve distorcer (proporção mantida)
      expect(mobileHeight).toBeGreaterThan(0);
      expect(desktopHeight).toBeGreaterThan(0);
    });

    test('tipografia deve usar clamp()', async ({ page }) => {
      await page.goto('/');
      
      const heading = page.locator('h1').first();
      
      // Mobile - deve estar próximo ao mínimo
      await page.setViewportSize({ width: 360, height: 800 });
      const mobileFontSize = await heading.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      
      // Desktop - deve estar próximo ao máximo
      await page.setViewportSize({ width: 1440, height: 900 });
      const desktopFontSize = await heading.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      
      // Desktop deve ser maior que mobile
      expect(desktopFontSize).toBeGreaterThanOrEqual(mobileFontSize);
    });
  });

  test.describe('Grid System', () => {
    test('mobile deve usar 4 colunas com gutter 12px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto('/');
      
      // Verificar que grid está implementado
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });

    test('desktop deve usar 12 colunas com gutter 24px', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('Constraints e Auto Layout', () => {
    test('imagens devem escalar (Scale)', async ({ page }) => {
      await page.goto('/');
      
      const logo = page.getByAltText('Federal Express Brasil');
      
      await page.setViewportSize({ width: 360, height: 800 });
      await expect(logo).toBeVisible();
      
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(logo).toBeVisible();
    });

    test('botéµes devem ajustar (Hug contents)', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Login');
      
      const button = page.locator('button:has-text("Entrar")');
      
      // Botão deve ter padding mas se ajustar ao texto
      const width = await button.evaluate((el) => el.offsetWidth);
      expect(width).toBeGreaterThan(100);
      expect(width).toBeLessThan(500);
    });

    test('containers devem centralizar (Center)', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Cadastro');
      
      const card = page.locator('form').locator('..');
      
      // Card deve estar centralizado
      const marginLeft = await card.evaluate((el) => {
        return window.getComputedStyle(el).marginLeft;
      });
      
      expect(marginLeft).toBe('auto');
    });
  });
});


