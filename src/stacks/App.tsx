import 'dockview/dist/styles/dockview.css';
import {useEffect, useRef} from 'react';
import {useShell} from '../hooks/useShell';
import {useEditor} from '../hooks/useEditor';
import {DockviewReact} from 'dockview';
import {Watermark} from './Watermark';
import {Editor} from './Editor';
import {Shell} from './Shell';
import {Tree} from './Tree';

import type * as D from 'dockview';
import type {FileSystemAPI} from '@webcontainer/api';

export function App() {
  const init = useRef(false);
  const api = useRef<D.DockviewApi | null>(null);

  const initDockview = (event: D.DockviewReadyEvent) => {
    api.current = event.api;
    api.current.addPanel({
      tabComponent: 'lockedTab',
      component: 'terminal',
      id: 'terminal',
      title: 'Terminal',
    });
  };

  const openPreview = (url: string, port: number) => {
    api.current?.addPanel({
      id: port.toString(),
      title: `Port: ${port}`,
      component: 'preview',
      params: {url},
      position: {
        direction: 'right',
        referencePanel: 'terminal',
      },
    });
  };

  const editor = useEditor();
  const shell = useShell(openPreview);

  const openFile = async (path: string, name: string) => {
    const contents = await shell?.container?.fs.readFile(path);
    const panel = api.current?.getPanel(path);
    if (panel) {
      panel.api.setActive();
    } else {
      api.current?.addPanel({
        component: 'editor',
        id: path,
        title: name,
        params: {
          path,
          contents,
          fs: shell.container?.fs,
        },
        position: {
          direction: 'right',
          referencePanel: 'tree',
        },
      });
    }
  };

  const panels: D.PanelCollection<D.IDockviewPanelProps> = {
    terminal: (props: D.IDockviewPanelProps<{}>) => {
      return (
        <Shell
          instance={shell}
          panel={props.api}
        />
      );
    },
    editor: (props: D.IDockviewPanelProps<{path: string, fs: FileSystemAPI, contents?: string}>) => {
      return (
        <Editor
          path={props.params.path}
          contents={props.params.contents}
          fs={props.params.fs}
        />
      );
    },
    tree: (props: D.IDockviewPanelProps<{fs: FileSystemAPI}>) => {
      return (
        <Tree
          fs={props.params.fs}
          onTriggerItem={openFile}
        />
      );
    },
    preview: (props: D.IDockviewPanelProps<{url: string}>) => {
      return (
        <iframe src={props.params.url}/>
      );
    },
  };

  const headers: D.PanelCollection<D.IDockviewPanelHeaderProps> = {
    lockedTab: (props: D.IDockviewPanelHeaderProps) => {
      return (
        <div>
          <span>{props.api.title}</span>
        </div>
      );
    },
  };

  useEffect(() => {
    if (!init.current && api.current && editor && shell?.container?.fs) {
      api.current.addPanel({
        component: 'tree',
        id: 'tree',
        title: 'Explorer',
        params: {
          fs: shell.container.fs,
        },
        tabComponent: 'lockedTab',
        position: {
          direction: 'left',
          referencePanel: 'terminal',
        },
      });
      init.current = true;
    }
  }, [editor, shell]);

  return (
    <DockviewReact
      className="dockview-theme-dark"
      watermarkComponent={Watermark}
      tabComponents={headers}
      components={panels}
      onReady={initDockview}
    />
  );
}
