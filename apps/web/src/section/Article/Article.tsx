import { Preview } from '@soroush.tech/markdown'
import type { Gist } from 'src/types/github'
import { LayoutFrame } from 'src/common/LayoutFrame'

export interface ArticleProps {
  data: Gist
}

export function Article({ data }: Readonly<ArticleProps>) {
  return (
    // 1280px including the margins
    <LayoutFrame as="section" layout={{ maxWidth: '1280px' }} minWidth={0} py={4} mt={3} mb={4}>
      <Preview>{data.files['en.md'].content}</Preview>
    </LayoutFrame>
  )
}
