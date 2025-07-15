import { BlockStack, Box, Text, Icon, InlineStack, Popover, OptionList } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import {
  CaretDownIcon,
  ListBulletedIcon,
  ListNumberedIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon
} from '@shopify/polaris-icons';
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Paragraph from '@tiptap/extension-paragraph'
import '../routes/styles/editorStyles.css'

interface EditorProps {
  type: string
  content: string
  handleEditValue: (type: string, value: string) => void
}

function Editor({ type, content, handleEditValue }: EditorProps) {
  const [focused, setFocused] = useState(false)
  const [TextLevel, setTextLevel] = useState<string[]>(['Paragraph'])
  const [popoverActive, setPopoverActive] = useState(true);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <button className="button-popover" onClick={togglePopoverActive} >
      {TextLevel.map(level => level === 'Paragraph' ? 'Paragraph' : `Heading ${level}`)}
      <div style={{ width: '20px', height: '20px' }}>
        <Icon
          source={CaretDownIcon}
          tone="base"
        />
      </div>
    </button>
  );
  const editor = useEditor({
    extensions: [
      StarterKit,
      Paragraph,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline],
    content: `<p>${content}</p>`,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onUpdate: ({ editor }) => {
      handleEditValue(type, editor?.getHTML())
      if (editor.isActive('paragraph')) setTextLevel(['Paragraph'])

      for (let level = 1; level <= 6; level++) {
        if (editor.isActive('heading', { level })) {
          setTextLevel([level.toString()]);
          return;
        }
      }
    },
    editorProps: {
      attributes: {
        class: '_Editor'
      }
    }
  })

  useEffect(() => {
    editor?.commands.setContent(content)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[content])

  const handleOnchangeValue = useCallback((value: string[]) => {
    if (!editor) return
    if (Number(value[0]) > 0) {
      const level = Number(value[0])
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
    }
    else {
      editor.chain().focus().setParagraph().run()
    }
  }, [editor])

  if (!editor) return null



  return (
    <Box>
      <div className={`${focused ? '_Editor-conteiner-focused' : '_Editor-conteiner'}`} >
        <BlockStack gap='0'>
          <div style={{ background: 'var(--p-color-bg-surface-secondary)', borderRadius: 'var(--p-border-radius-200) var(--p-border-radius-200) 0 0' }}>
            <Box padding='100' paddingInlineStart='200' paddingInlineEnd='200'>
              <InlineStack align='space-between' blockAlign='center' >

                <div>
                  <Popover
                    active={popoverActive}
                    activator={activator}
                    onClose={togglePopoverActive}
                  >
                    <OptionList
                      onChange={handleOnchangeValue}
                      options={[
                        { value: 'Paragraph', label: 'Paragraph' },
                        { value: '1', label: 'Heading 1' },
                        { value: '2', label: 'Heading 2' },
                        { value: '3', label: 'Heading 3' },
                        { value: '4', label: 'Heading 4' },
                        { value: '5', label: 'Heading 5' },
                        { value: '6', label: 'Heading 6' },
                      ]}
                      selected={TextLevel}
                    />
                  </Popover>
                </div>

                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={TextBoldIcon}
                    tone="primary"
                  />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={TextItalicIcon}
                    tone="primary"
                  />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive('underline') ? 'button-icon-active' : 'button-icon'}
                >
                  <div style={{ width: '15', height: '5' }}>
                    <Icon
                      source={TextUnderlineIcon}
                      tone="primary"
                    />
                  </div>

                </button>
                <Text as='span' tone="subdued" variant='bodyLg' fontWeight='regular'  >|</Text>
                <button
                  onClick={() => editor.chain().focus().toggleTextAlign('left').run()}
                  className={editor.isActive({ textAlign: 'left' }) ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={TextAlignLeftIcon}
                    tone="primary"
                  />
                </button>

                <button
                  onClick={() => editor.chain().focus().toggleTextAlign('center').run()}
                  className={editor.isActive({ textAlign: 'center' }) ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={TextAlignCenterIcon}
                    tone="primary"
                  />
                </button>

                <button
                  onClick={() => editor.chain().focus().toggleTextAlign('right').run()}
                  className={editor.isActive({ textAlign: 'right' }) ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={TextAlignRightIcon}
                    tone="primary"
                  />
                </button>
                <Text as='span' tone="subdued" variant='bodyLg' fontWeight='regular'  >|</Text>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive('bulletList') ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={ListBulletedIcon}
                    tone="primary"
                  />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor.isActive('orderedList') ? 'button-icon-active' : 'button-icon'}
                >
                  <Icon
                    source={ListNumberedIcon}
                    tone="primary"
                  />
                </button>
              </InlineStack>
            </Box>
          </div>
          <div>
            <EditorContent editor={editor} />
          </div>
        </BlockStack>
      </div>
    </Box>

  )
}

export default Editor
