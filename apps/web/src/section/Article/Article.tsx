import { Preview } from '@soroush.tech/markdown'
import type { Gist } from 'src/types/github'
import { View } from '@soroush.tech/design-system/View'

export interface ArticleProps {
  data: Gist
}

export function Article({ data }: Readonly<ArticleProps>) {
  return (
    <View as="section" layout minWidth={0} py={4} mt={3} mb={4}>
      <Preview>{data.files['en.md'].content}</Preview>
    </View>
  )
}
