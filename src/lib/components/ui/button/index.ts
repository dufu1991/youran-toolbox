import type { Button as ButtonPrimitive } from 'bits-ui';
import Root from './button.svelte';

type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

type Props = ButtonPrimitive.RootProps & {
	variant?: Variant;
	size?: Size;
};

export { Root, type Props, Root as Button, type Props as ButtonProps, type Variant, type Size };
