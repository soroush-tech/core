import { Flex } from '@soroush.tech/design-system/Flex'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { Typography } from '@soroush.tech/design-system/Typography'
import { AppToolbar } from './common/AppToolbar'
import { DocumentEditor } from './common/DocumentEditor'
import { useDocument } from './hooks/useDocument'
import { editorTheme } from './theme/editorTheme'
import { GlobalStyles } from './theme/GlobalStyles'

export function App() {
  const { content, filePath, isDirty, error, change, newDocument, open, save } = useDocument()

  return (
    <ThemeProvider theme={editorTheme}>
      <GlobalStyles />
      <Flex flexDirection="column" gap={2} p={3} height="100vh">
        <AppToolbar
          filePath={filePath}
          isDirty={isDirty}
          onNew={() => void newDocument()}
          onOpen={() => void open()}
          onSave={() => void save()}
          onSaveAs={() => void save(true)}
        />
        {error && (
          <Typography role="alert" color="error" m={0}>
            {error}
          </Typography>
        )}
        <DocumentEditor value={content} onChange={change} />
      </Flex>
    </ThemeProvider>
  )
}
