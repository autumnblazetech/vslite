import { DockviewReact, GridviewReact, Orientation, PaneviewReact } from 'dockview';
import { useRef } from 'react';
import { Editor } from './Editor';
import { FileTree } from './FileTree';
import { Terminal } from './Terminal';
import { Watermark } from './Watermark';
import { useStartup } from '../hooks/useStartup';
import { useDarkMode } from '../hooks/useDarkMode';
import * as panels from '../modules/panels';

import type { DockviewApi, GridviewApi, PaneviewApi, IGridviewPanelProps, IPaneviewPanelProps, IDockviewPanelProps } from 'dockview';
import type { FileSystemAPI } from '@webcontainer/api';
import type { ShellInstance } from '../hooks/useShell';
import type { CollabInstance } from '../hooks/useCollab';

export function Dock() {
  const grid = useRef<GridviewApi>(null);
  const dock = useRef<DockviewApi>(null);
  const panes = useRef<PaneviewApi>(null);
  const isDark = useDarkMode();

  useStartup(grid, dock, panes);

  return (
    <GridviewReact
      className={isDark ? 'dockview-theme-dark' : 'dockview-theme-light'}
      components={{
        dock: (props: IGridviewPanelProps<{api: React.RefObject<DockviewApi>}>) => (
          <DockviewReact
            watermarkComponent={Watermark}
            components={{
              editor: (props: IDockviewPanelProps<{fs: FileSystemAPI, path: string, sync: CollabInstance}>) => (
                <Editor fs={props.params.fs} path={props.params.path} sync={props.params.sync}/>
              ),
              preview: (props: IDockviewPanelProps<{url: string}>) => (
                <iframe
                  src={props.params.url}
                  allow="cross-origin-isolated"
                  // @ts-ignore
                  credentialless
                />
              ),
            }}
            onReady={event => {props.params.api.current = event.api}}
          />
        ),
        panes: (props: IGridviewPanelProps<{api: React.RefObject<PaneviewApi>}>) => (
          <PaneviewReact
            components={{
              filetree: (props: IPaneviewPanelProps<{dock: DockviewApi, fs: FileSystemAPI, sync: CollabInstance}>) => (
                <FileTree
                  fs={props.params.fs}
                  onRenameItem={panels.createFileRenameHandler(props.params.dock, props.params.fs)}
                  onTriggerItem={panels.createFileOpener(props.params.dock, props.params.fs, props.params.sync)}
                />
              ),
            }}
            onReady={event => {props.params.api.current = event.api}}
          />
        ),
        terminal: (props: IGridviewPanelProps<{dock: DockviewApi, shell: ShellInstance}>) => (
          <Terminal
            shell={props.params.shell}
            panelApi={props.api}
            onServerReady={panels.createPreviewOpener(props.params.dock)}
          />
        ),
      }}
      proportionalLayout={false}
      orientation={Orientation.HORIZONTAL}
      onReady={event => {
        grid.current = event.api;
        panels.openDock(event.api, dock);
        panels.openPanes(event.api, panes);
      }}
    />
  );
}