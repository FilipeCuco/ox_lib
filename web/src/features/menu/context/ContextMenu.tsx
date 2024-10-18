import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { Box, createStyles, Flex, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ContextMenuPosition, ContextMenuProps } from '../../../typings';
import ContextButton from './components/ContextButton';
import { fetchNui } from '../../../utils/fetchNui';
import ReactMarkdown from 'react-markdown';
import HeaderButton from './components/HeaderButton';
import ScaleFade from '../../../transitions/ScaleFade';
import MarkdownComponents from '../../../config/MarkdownComponents';

const openMenu = (id: string | undefined) => {
  fetchNui<ContextMenuProps>('openContext', { id: id, back: true });
};

const useStyles = createStyles((theme, params: {position?: ContextMenuPosition}) => ({
  container: {
    position: 'absolute',
    marginTop: params.position === 'top-left' || params.position === 'top-right' ? 20 : 0,
    marginLeft: params.position === 'top-left' || params.position === 'bottom-left' ? 20 : 0,
    marginRight: params.position === 'top-right' || params.position === 'bottom-right' ? 5 : 0,
    marginBottom: params.position === 'bottom-left' || params.position === 'bottom-right' ? 60 : 0,
    right: params.position === 'top-right' || params.position === 'bottom-right' ? 20 : undefined,
    left: params.position === 'bottom-left' ? 20 : undefined,
    bottom: params.position === 'bottom-left' || params.position === 'bottom-right' ? 1 : undefined,
    width: 320,
    height: 580,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  titleContainer: {
    borderRadius: 4,
    flex: '1 85%',
    backgroundColor: theme.colors.dark[6],
  },
  titleText: {
    color: theme.colors.dark[0],
    padding: 6,
    textAlign: 'center',
  },
  buttonsContainer: {
    height: 560,
    overflowY: 'scroll',
  },
  buttonsFlexWrapper: {
    gap: 3,
  },
}));

const ContextMenu: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuProps>({
    position: 'top-left',
    title: '',
    options: { '': { description: '', metadata: [] } },
  });
  const { classes } = useStyles({position: contextMenu.position});
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredOptions = Object.entries(contextMenu.options).filter(
    ([key, option]) => {
      if (option.type === 'search' || search === '') {
        return true;
      } else {
        let match = false;
        if (option.title) {
          match = option.title.toLowerCase().includes(search.toLowerCase());
        }
        if (option.description) {
          match = match || option.description.toLowerCase().includes(search.toLowerCase());
        }
        return match;
      }
    }
  );

  const closeContext = () => {
    if (contextMenu.canClose === false) return;
    setVisible(false);
    fetchNui('closeContext');
    setSearch('');
  };

  // Hides the context menu on ESC
  useEffect(() => {
    if (!visible) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (['Escape'].includes(e.code)) closeContext();
    };

    window.addEventListener('keydown', keyHandler);

    return () => window.removeEventListener('keydown', keyHandler);
  }, [visible]);

  useNuiEvent('hideContext', () => setVisible(false));

  useNuiEvent<ContextMenuProps>('showContext', async (data) => {
    if (visible) {
      setVisible(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!data.position) data.position = 'top-left';
    setContextMenu(data);
    setVisible(true);
  });

  return (
    <Box className={classes.container}>
      <ScaleFade visible={visible}>
        <Flex className={classes.header}>
          {contextMenu.menu && (
            <HeaderButton icon="chevron-left" iconSize={16} handleClick={() => openMenu(contextMenu.menu)} />
          )}
          <Box className={classes.titleContainer}>
            <Text className={classes.titleText}>
              <ReactMarkdown components={MarkdownComponents}>{contextMenu.title}</ReactMarkdown>
            </Text>
          </Box>
          <HeaderButton icon="xmark" canClose={contextMenu.canClose} iconSize={18} handleClick={closeContext} />
        </Flex>
        <Box className={classes.buttonsContainer}>
        <Stack className={classes.buttonsFlexWrapper}>
          {filteredOptions.map((option, index) => {
            const isSearch = option[1].type === 'search';
            return (
              <ContextButton 
                option={option} 
                key={`context-item-${index}`} 
                handleChange={isSearch ? handleChange : undefined} 
                search={isSearch ? search : undefined} 
              />
            );
          })}
        </Stack>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default ContextMenu;