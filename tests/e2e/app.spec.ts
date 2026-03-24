import { expect, test } from '@playwright/test'

test('home, journey and workspace routes load', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '把求职拆成可执行的系统，而不是一轮轮碰运气。' })).toBeVisible()

  await page.goto('/journey')
  await expect(page.getByRole('heading', { name: '求职阶段模块' })).toBeVisible()

  await page.goto('/workspace')
  await expect(page.getByRole('heading', { name: '把简历、岗位和公司信息放进同一套分析系统里。' })).toBeVisible()
})

test('prepare workflow can review and sync to workspace', async ({ page }) => {
  await page.goto('/journey/prepare')

  await page.getByPlaceholder('例如：高级前端工程师 / AI 产品前端').fill('AI 前端工程师')
  await page.getByPlaceholder('建议结构：我是谁 / 我做过什么 / 我为什么适合这个方向').fill('我有 5 年前端经验，擅长 AI 产品和平台化交付。')
  await page.getByTestId('prepare-review').click()

  await expect(page.getByRole('heading', { name: 'AI 优化结果' })).toBeVisible()
  await page.getByTestId('prepare-sync').click()

  await page.goto('/workspace')
  await expect(page.locator('textarea').first()).toHaveValue(/AI 前端工程师/)
})

test('match page can generate diagnosis', async ({ page }) => {
  await page.goto('/journey/match')
  await page.getByTestId('match-diagnose').click()

  await expect(page.getByText('表达风险与下一步')).toBeVisible()
  await expect(page.getByRole('heading', { name: '下一步动作' })).toBeVisible()
})

test('apply page can create and persist application', async ({ page }) => {
  await page.goto('/journey/apply')
  await page.getByTestId('apply-add').click()

  const companyInputs = page.getByPlaceholder('公司')
  await companyInputs.nth(0).fill('测试公司')
  await page.getByPlaceholder('岗位').nth(0).fill('前端工程师')
  await page.getByLabel('作为当前投递对象').first().check()
  await page.getByTestId('apply-advise').click()
  await expect(page.getByText('优先目标')).toBeVisible()
  await expect(page.getByText('当前投递对象：测试公司 / 前端工程师')).toBeVisible()
  await page.reload()
  await expect(page.getByPlaceholder('公司').nth(0)).toHaveValue('测试公司')
})

test('interview page can generate question bank and review', async ({ page }) => {
  await page.goto('/journey/interview')
  await page.getByTestId('interview-generate').click()
  await expect(page.getByText('AI 面试题包')).toBeVisible()
  await expect(page.getByText('自我介绍').first()).toBeVisible()

  await page.getByPlaceholder('公司名称').fill('测试公司')
  await page.getByPlaceholder('面试轮次，例如：一面 / HR 面').fill('一面')
  await page.getByPlaceholder('记录被问到的问题').fill('请做自我介绍')
  await page.getByPlaceholder('记录你的回答摘要').fill('我介绍了自己的 AI 前端经验')
  await page.getByPlaceholder('你自己的反思').fill('回答偏抽象，需要更多量化结果')
  await page.getByTestId('interview-review').click()

  await expect(page.getByRole('heading', { name: '下一步动作' })).toBeVisible()
})

test('journey page updates active sidebar item while scrolling', async ({ page }) => {
  await page.goto('/journey')

  const prepareLink = page.locator('a[href="/journey#prepare"]')
  const interviewLink = page.locator('a[href="/journey#interview"]')

  await expect(prepareLink).toHaveClass(/journey-sidebar__link--active/)

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await expect(interviewLink).toHaveClass(/journey-sidebar__link--active/)
})

test('mobile sticky action bars are available on long-form pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto('/journey/prepare')
  await page.getByPlaceholder('例如：高级前端工程师 / AI 产品前端').fill('移动端测试岗位')
  await page.getByPlaceholder('建议结构：我是谁 / 我做过什么 / 我为什么适合这个方向').fill('我有前端项目交付经验，做过平台和 AI 相关页面，想投递更匹配的前端岗位。')
  await expect(page.getByTestId('prepare-mobile-review')).toBeVisible()
  await page.getByTestId('prepare-mobile-review').click()
  await expect(page.getByRole('heading', { name: 'AI 优化结果' })).toBeVisible()
  await expect(page.getByTestId('prepare-mobile-sync')).toBeVisible()

  await page.goto('/journey/apply')
  await expect(page.getByTestId('apply-mobile-add')).toBeVisible()
  await page.getByTestId('apply-mobile-add').click()
  await expect(page.getByPlaceholder('公司').first()).toBeVisible()

  await page.goto('/journey/interview')
  await expect(page.getByTestId('interview-mobile-generate')).toBeVisible()
  await page.getByTestId('interview-mobile-generate').click()
  await expect(page.getByText('AI 面试题包')).toBeVisible()
  await expect(page.getByTestId('interview-mobile-review')).toBeVisible()
})
