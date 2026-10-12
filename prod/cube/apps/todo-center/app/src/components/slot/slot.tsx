interface Props {
  slotName: string;
  children: React.ReactNode | React.ReactNode[];
}

export const Slot = (props: Props): JSX.Element => {
  return (
    <>
      {props.children}
    </>
  )
}
