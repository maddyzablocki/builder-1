import * as React from 'react';
import builder, {
  Builder,
  BuilderStore,
  onChange,
  withBuilder,
  BuilderElement,
  stringToFunction,
  BuilderBlocks,
} from '@builder.io/react';

interface Branch {
  expression?: string;
  blocks: BuilderElement[];
}

interface IfElseBlockProps {
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
  branches: Branch[];
}

export class IfElseBlock extends React.Component<IfElseBlockProps> {
  private getMatchingBranch(branches = this.props.branches) {
    if (!(branches && branches.length)) {
      return null;
    }

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      const isLast = i === branches.length - 1;
      if (isLast && !branch.expression) {
        return { index: i, blocks: branch.blocks };
      }
      const fn = stringToFunction(branch.expression || '');
      const result = fn(
        this.props.builderState && this.props.builderState.state,
        null,
        this.props.builderBlock,
        builder,
        null,
        this.props.builderState!.update,
        Builder,
        this.props.builderState?.context
      );
      if (result) {
        return { index: i, blocks: branch.blocks };
      }
    }
    return null;
  }

  render() {
    const result = this.getMatchingBranch();
    if (!result) {
      return null;
    }

    return (
      <BuilderBlocks
        child
        parentElementId={this.props.builderBlock && this.props.builderBlock.id}
        blocks={result.blocks}
        dataPath={`component.options.branches.${result.index}.blocks`}
      />
    );
  }
}

const defaultBlock = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      flexShrink: '0',
      position: 'relative',
      marginTop: '30px',
      textAlign: 'center',
      lineHeight: 'normal',
      height: 'auto',
    },
  },
  component: {
    name: 'Text',
    options: {
      text: '<p>Enter some text...</p>',
    },
  },
};

withBuilder(IfElseBlock, {
  name: 'Shopify:IfElse',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'branches',
      type: 'array',
      subFields: [
        {
          name: 'expression',
          type: 'javascript',
        },
        {
          name: 'blocks',
          type: 'array',
          hideFromUI: true,
          defaultValue: [defaultBlock],
        },
      ],
    },
  ],
});