import React from "react";
import PropTypes from "prop-types";
import { View, TextInput, Text, AsyncStorage } from "react-native";

import Tag from "./Tag";
import styles from "./styles";
import theme from "../../Theme";

class Tags extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: [],
      text: props.initialText,
      border_color_3: "#886cca"
    };
  }


  componentWillReceiveProps(props) {
    // const { initialTags = [], initialText = " " } = props;
    // this.setState({
    //   tags: initialTags,
    //   text: initialText
    // });
  }

  addTag = text => {
    this.setState(
      {
        tags: [...this.state.tags, text.trim()],
        text: " "
      },
      () => this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
    );

    this.state.tags.push(text.trim());
    AsyncStorage.setItem("TagsKey", JSON.stringify(this.state.tags));

    // AsyncStorage.getItem("TagsKey").then(value => {
    //   alert(value);
    // });
  };

  onTagChangeText = text => {
    // AsyncStorage.setItem("TagsKey", JSON.stringify(this.state.tags));
    if (text.length === 0) {
      this.setState(
        {
          tags: this.state.tags.slice(0, -1),
          text: this.state.tags.slice(-1)[0] || " "
        },
        () =>
          this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
      );
    } else if (
      text.length > 1 &&
      this.props.createTagOnString.includes(text.slice(-1)) &&
      !(this.state.tags.indexOf(text.slice(0, -1).trim()) > -1)
    ) {
      this.addTag(text.slice(0, -1));
    } else {
      this.setState({ text });
    }
  };

  onTagSubmitEditing = () => {
    let text = this.state.text;
    if (text.length > 1 && !(this.state.tags.indexOf(text.trim()) > -1)) {
      this.addTag(text);
    } else {
    }

    try {
      // AsyncStorage.setItem("TagsKey", JSON.stringify(this.state.tags));
      //alert(JSON.stringify(tagsArray))
    } catch (error) {
      // Error saving data
      alert("error occured");
    }
  };

  onTouchTagInput() {
    this.setState({
      border_color_3: "white"
    });
  }

  offTouchTitle() {
    this.setState({
      border_color_3: "#886cca"
    });
  }

  render() {
    const {
      containerStyle,
      style,
      tagContainerStyle,
      tagTextStyle,
      deleteTagOnPress,
      onTagPress,
      readonly,
      maxNumberOfTags,
      inputStyle,
      inputContainerStyle,
      textInputProps,
      renderTag
    } = this.props;

    return (
      <View>
        <View style={[styles.container, containerStyle, style]}>
          {this.state.tags.map((tag, index) => {
            const tagProps = {
              tag,
              index,
              deleteTagOnPress,
              onPress: e => {
                if (deleteTagOnPress && !readonly) {
                  this.setState(
                    {
                      tags: [
                        ...this.state.tags.slice(0, index),
                        ...this.state.tags.slice(index + 1)
                      ]
                    },
                    () => {
                      this.props.onChangeTags &&
                        this.props.onChangeTags(this.state.tags);
                      onTagPress && onTagPress(index, tag, e, true);
                    }
                  );
                } else {
                  onTagPress && onTagPress(index, tag, e, false);
                }
              },
              tagContainerStyle,
              tagTextStyle
            };

            return renderTag(tagProps);
          })}
        </View>
        {!readonly && maxNumberOfTags > this.state.tags.length && (
          <View style={{ marginTop: "2%" }}>
            <Text
              style={{
                color: "white",
                fontFamily: theme.FONT_SEMI_BOLD,
                letterSpacing: 0.5,
                paddingStart: 5
              }}
            >
              New tag
            </Text>
            <View
              style={[
                styles.textInputContainer,
                inputContainerStyle,
                { borderColor: this.state.border_color_3 }
              ]}
            >
              <TextInput
                {...textInputProps}
                value={this.state.text}
                style={[styles.textInput, inputStyle]}
                onFocus={() => this.onTouchTagInput()}
                onBlur={() => this.offTouchTitle()}
                onChangeText={this.onTagChangeText}
                onSubmitEditing={this.onTagSubmitEditing}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

Tags.defaultProps = {
  initialTags: [],
  initialText: " ",
  createTagOnString: [",", " "],
  createTagOnReturn: true,
  readonly: false,
  deleteTagOnPress: true,
  maxNumberOfTags: Number.POSITIVE_INFINITY,
  renderTag: ({ tag, index, ...rest }) => (
    <Tag key={`${tag}-${index}`} label={tag} {...rest} />
  )
};

Tags.propTypes = {
  initialText: PropTypes.string,
  initialTags: PropTypes.arrayOf(PropTypes.string),
  createTagOnString: PropTypes.array,
  createTagOnReturn: PropTypes.bool,
  onChangeTags: PropTypes.func,
  readonly: PropTypes.bool,
  maxNumberOfTags: PropTypes.number,
  deleteTagOnPress: PropTypes.bool,
  renderTag: PropTypes.func,
  /* style props */
  containerStyle: PropTypes.any,
  style: PropTypes.any,
  inputContainerStyle: PropTypes.any,
  inputStyle: PropTypes.any,
  tagContainerStyle: PropTypes.any,
  tagTextStyle: PropTypes.any,
  textInputProps: PropTypes.object
};

export { Tag };
export default Tags;
