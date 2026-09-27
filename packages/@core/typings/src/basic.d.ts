interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;
type TabOption = BasicOption;

type ClassType
  = | Array<ClassType>
    | boolean
    | null
    | object
    | string
    | undefined;

export type { BasicOption, ClassType, SelectOption, TabOption };
