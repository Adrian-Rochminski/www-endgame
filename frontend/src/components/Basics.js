export const LinkButton = ({name, link}) => {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="p-button font-bold">{name}</a>
    )
}